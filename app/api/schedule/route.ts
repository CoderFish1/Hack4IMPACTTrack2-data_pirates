import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { symptoms } = await req.json();
    if (!symptoms) return NextResponse.json({ error: 'Symptoms required' }, { status: 400 });

    const prompt = `You are an AI medical routing specialist.
Patient symptoms/condition: ${symptoms}

Generate appropriate specialist recommendations. Return ONLY valid JSON:
{
  "urgency": "Emergency" | "See Doctor Soon" | "Routine",
  "advice": "One sentence strictly advising what the patient should do next."
}

Ensure specialties match the symptoms precisely.`;

    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const data = JSON.parse(response.choices[0].message.content || '{}');
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Specialist matching failed' }, { status: 500 });
  }
}

