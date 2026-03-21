import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { drugName } = await req.json();
    if (!drugName) return NextResponse.json({ error: 'Drug name required' }, { status: 400 });

    const prompt = `You are a clinical pharmacist and drug pricing expert in India.
The patient has a prescription for: "${drugName}"

Return ONLY a valid JSON object with this exact structure:
{
  "brand_name": "Original brand name of the drug",
  "generic_name": "The generic/salt name",
  "brand_price": "Approximate price in INR per strip/unit (e.g., ₹85 per strip of 10)",
  "generic_price": "Approximate generic equivalent price in INR (e.g., ₹12 per strip of 10)",
  "savings_percent": "Approximate savings percentage as a number (e.g., 85)",
  "alternatives": [
    { "name": "Generic Brand 1", "price": "₹X", "manufacturer": "Company Name" },
    { "name": "Generic Brand 2", "price": "₹X", "manufacturer": "Company Name" },
    { "name": "Generic Brand 3", "price": "₹X", "manufacturer": "Company Name" }
  ],
  "availability": "Available at Jan Aushadhi stores, government hospitals",
  "safety_note": "Brief note on generic equivalence safety"
}

Be realistic with Indian pharmacy pricing. Jan Aushadhi generics are typically 50-90% cheaper.`;

    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const data = JSON.parse(response.choices[0].message.content || '{}');
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch pricing data' }, { status: 500 });
  }
}
