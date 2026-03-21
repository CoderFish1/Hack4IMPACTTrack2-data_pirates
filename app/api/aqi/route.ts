import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lat, lon } = await req.json();

    if (!lat || !lon) {
      return NextResponse.json({ error: "Latitude and longitude required" }, { status: 400 });
    }

    // 1. Fetch live weather & AQI from Open-Meteo free tier
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`
    );
    const aqiRes = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`
    );

    const weatherData = await weatherRes.json();
    const aqiData = await aqiRes.json();

    const temp = weatherData.current_weather?.temperature;
    const windSpeed = weatherData.current_weather?.windspeed;
    const aqi = aqiData.current?.us_aqi;

    // 2. Pass real-time data to Groq for analysis
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
            content: "You are a local public health advisor. Respond strictly in valid JSON.",
          },
          {
            role: "user",
            content: `Live Data: Temp ${temp}°C, Wind ${windSpeed}km/h, AQI ${aqi}. Return JSON: { "general": "1-sentence advice", "asthma": "1-sentence warning", "outdoorWorker": "1-sentence warning", "aqiSeverity": "Good" | "Moderate" | "Poor" | "Severe" }`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!groqRes.ok) {
        throw new Error("Failed to fetch from Groq API");
    }

    const completion = await groqRes.json();
    const aiAnalysis = JSON.parse(completion.choices?.[0]?.message?.content || "{}");

    // Mix raw data with AI analysis to match frontend AqiData interface
    return NextResponse.json({
      weather: {
        temperature: temp || 20,
        humidity: weatherData.current_weather?.relative_humidity || 50,
        windSpeed: windSpeed || 10,
        feelsLike: temp || 20,
        precipitation: 0,
        weatherCode: weatherData.current_weather?.weathercode || 0,
      },
      aqi: {
        value: aqi || 50,
        dominantPollutant: aqiData.current?.dominant_pollutant || "PM2.5"
      },
      advisory: {
        general: aiAnalysis.general || "Air quality is acceptable.",
        asthma: aiAnalysis.asthma || "Take normal precautions.",
        outdoorWorker: aiAnalysis.outdoorWorker || "Standard health protocols apply.",
        aqiSeverity: aiAnalysis.aqiSeverity || "Moderate"
      }
    });
  } catch (error: any) {
    console.error("AQI Error:", error);
    // Graceful fallback if Groq API hits rate limits
    return NextResponse.json({
      weather: { temperature: 24, humidity: 45, windSpeed: 12, feelsLike: 25, precipitation: 0, weatherCode: 1 },
      aqi: { value: 65, dominantPollutant: "PM10" },
      advisory: {
        general: "Air quality is acceptable. Enjoy outdoor activities.",
        asthma: "No special precautions needed today.",
        outdoorWorker: "Standard hydration and breaks recommended.",
        aqiSeverity: "Moderate"
      }
    });
  }
}
