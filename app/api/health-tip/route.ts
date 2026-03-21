import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function GET() {
  try {
    const prompt = `You are a preventive health AI. Generate ONE practical, actionable health tip for today.
Keep it under 3 sentences. Make it specific and evidence-based.
Return ONLY JSON:
{
  "tip": "...",
  "category": "Nutrition|Exercise|Sleep|Mental Health|Hydration|Prevention",
  "emoji": "🥗"
}`;

    const res = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const data = JSON.parse(res.choices[0].message.content || "{}");
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      tip: "Stay hydrated! Aim for 8 glasses of water daily to maintain optimal kidney function and energy levels.",
      category: "Hydration",
      emoji: "💧",
    });
  }
}
