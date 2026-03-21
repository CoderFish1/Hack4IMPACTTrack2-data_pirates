import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
    }

    // Fetch weather from Open-Meteo
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,apparent_temperature,precipitation,weather_code&timezone=auto`
    );
    const weatherData = await weatherRes.json();

    // Fetch AQI from WAQI (free demo token)
    const aqiRes = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=demo`
    );
    const aqiData = await aqiRes.json();

    const current = weatherData.current || {};
    const aqiValue = aqiData?.data?.aqi ?? "Unknown";
    const dominantPollutant = aqiData?.data?.dominentpol ?? "Unknown";

    const combinedData = `Temperature: ${current.temperature_2m}°C, Humidity: ${current.relative_humidity_2m}%, Wind: ${current.wind_speed_10m} km/h, Feels like: ${current.apparent_temperature}°C, Precipitation: ${current.precipitation}mm, AQI: ${aqiValue}, Dominant Pollutant: ${dominantPollutant}`;

    const prompt = `You are a local public health advisor. Weather is ${combinedData}. Return JSON: { "general": "1-sentence advice", "asthma": "1-sentence warning", "outdoorWorker": "1-sentence warning", "aqiSeverity": "Good" | "Moderate" | "Poor" | "Severe" }. Base aqiSeverity on: 0-50=Good, 51-100=Moderate, 101-200=Poor, 200+=Severe.`;

    const res = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const advisory = JSON.parse(res.choices[0].message.content || "{}");

    return NextResponse.json({
      weather: {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        feelsLike: current.apparent_temperature,
        precipitation: current.precipitation,
        weatherCode: current.weather_code,
      },
      aqi: {
        value: aqiValue,
        dominantPollutant,
      },
      advisory,
    });
  } catch (e) {
    console.error("AQI route error:", e);
    return NextResponse.json({ error: "Failed to fetch AQI data" }, { status: 500 });
  }
}
