import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { forwardedMessage } = (await req.json()) as { forwardedMessage?: string };
    if (!forwardedMessage?.trim()) {
      return NextResponse.json({ error: "forwardedMessage required" }, { status: 400 });
    }

    const prompt = `You are a strict medical fact-checker specializing in debunking health misinformation commonly shared on WhatsApp in India. Analyze this claim: "${forwardedMessage}". Respond in valid JSON: { "status": "FAKE" | "TRUE" | "NEEDS CONTEXT", "explanation": "A 2-sentence simple explanation.", "dangerLevel": "High" | "Medium" | "Low", "sources": "Brief mention of what medical evidence says" }`;

    const res = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const data = JSON.parse(res.choices[0].message.content || "{}");
    return NextResponse.json(data);
  } catch (e) {
    console.error("Myth buster error:", e);
    return NextResponse.json({ error: "Fact-check failed" }, { status: 500 });
  }
}
