import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json() as { transcript?: string };
    if (!transcript?.trim()) {
      return NextResponse.json({ error: "Transcript required" }, { status: 400 });
    }

    const prompt = `You are a clinical SOAP note AI scribe for a doctor.
Convert this doctor-patient encounter transcript into a structured clinical note.
Transcript: "${transcript}"

Return ONLY valid JSON:
{
  "subjective": "Patient's chief complaint and history of present illness",
  "objective": "Observed findings and vitals mentioned",
  "assessment": "Clinical impression or suspected diagnosis",
  "plan": "Treatment plan, follow-ups, medications ordered",
  "summary": "One sentence summary for the record"
}`;

    const res = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const data = JSON.parse(res.choices[0].message.content || "{}");
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Scribe generation failed" }, { status: 500 });
  }
}
