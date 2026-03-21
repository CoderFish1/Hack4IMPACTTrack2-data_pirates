import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { bloodType, location } = await req.json();
    if (!bloodType) return NextResponse.json({ error: 'Blood type required' }, { status: 400 });

    const prompt = `You are an emergency blood bank coordination system in India.
Patient needs blood type: ${bloodType}
Location: ${location || 'City Hospital Area'}

Return ONLY valid JSON matching this structure:
{
  "blood_type_needed": "${bloodType}",
  "compatible_types": ["list of compatible blood types"],
  "blood_banks": [
    { "name": "City Blood Bank", "address": "Near General Hospital, Sector 5", "distance": "0.8 km", "units_available": 4, "contact": "0674-2XXXXXX", "open_24h": true },
    { "name": "Red Cross Blood Center", "address": "Station Road", "distance": "2.1 km", "units_available": 2, "contact": "0674-3XXXXXX", "open_24h": false }
  ],
  "emergency_note": "Brief note on urgency and next steps"
}

Use realistic Indian names for places. Only return institutional blood bank contacts.`;

    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    });

    const data = JSON.parse(response.choices[0].message.content || '{}');
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Blood donor search failed' }, { status: 500 });
  }
}
