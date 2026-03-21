import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { location } = await req.json();

    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    // 1. Scrape live data from the web using Firecrawl
    const firecrawlRes = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: `Current weather temperature humidity wind speed and Air Quality Index AQI pollutants in ${location} today`,
        limit: 3,
        scrapeOptions: { formats: ["markdown"] }
      })
    });

    let contextData = "";
    if (firecrawlRes.ok) {
      const searchData = await firecrawlRes.json();
      contextData = searchData.data?.map((d: any) => d.markdown).join("\n\n") || "No recent data found.";
    }

    // 2. Pass scraped data to Groq for structured JSON extraction
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a live weather and health API. Extract the weather and AQI from the provided web search context for ${location}. Respond strictly in valid JSON matching this exact structure: 
{
  "weather": { "temperature": 25, "humidity": 60, "windSpeed": 15, "feelsLike": 26, "precipitation": 0, "weatherCode": 1 },
  "aqi": { "value": 75, "dominantPollutant": "PM2.5" },
  "advisory": { "general": "One sentence advice.", "asthma": "One sentence warning.", "outdoorWorker": "One sentence warning.", "aqiSeverity": "Good" | "Moderate" | "Poor" | "Severe" },
  "locationName": "Cleaned city name"
}
If data is missing from the context, make highly educated realistic estimates for ${location} today based on standard averages. Do not fail.`
          },
          {
            role: "user",
            content: `Scraped Web Context for ${location}:\n${contextData.slice(0, 5000)}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    });

    if (!groqRes.ok) {
      throw new Error("API Limit Reached");
    }

    const completion = await groqRes.json();
    const aiAnalysis = JSON.parse(completion.choices?.[0]?.message?.content || "{}");

    return NextResponse.json(aiAnalysis);
  } catch (error: any) {
    console.error("AQI Error:", error);
    // Graceful fallback if any API completely fails or rate limits
    return NextResponse.json({
      locationName: "Simulated Web Data",
      weather: { temperature: 24, humidity: 45, windSpeed: 12, feelsLike: 25, precipitation: 0, weatherCode: 1 },
      aqi: { value: 65, dominantPollutant: "PM10" },
      advisory: {
        general: "Air quality is acceptable. Simulated fallback due to API limits.",
        asthma: "No special precautions needed today.",
        outdoorWorker: "Standard hydration and breaks recommended.",
        aqiSeverity: "Moderate"
      }
    });
  }
}
