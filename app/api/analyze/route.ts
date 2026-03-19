import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 1. The Hack: Point the OpenAI client to Groq's servers
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, 
  baseURL: "https://api.groq.com/openai/v1", // This routes it to Groq for free!
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { symptoms } = body;

    if (!symptoms) {
      return NextResponse.json(
        { error: 'Symptoms are required to perform an analysis.' },
        { status: 400 }
      );
    }

    const systemPrompt = `
      You are a cautious, highly structured medical triage AI assistant.
      Analyze the user's symptoms and return ONLY a valid JSON object.
      Do not include markdown code blocks like \`\`\`json.

      The JSON MUST exactly match this structure:
      {
        "possible_conditions": ["Condition 1", "Condition 2"],
        "precautions": ["Actionable tip 1", "Actionable tip 2"],
        "recommendation_level": "Self-Care" // MUST BE EXACTLY ONE OF: "Self-Care", "Consult Doctor", "Urgent Care"
      }

      Disclaimer rule: Never provide a definitive diagnosis. Keep it safe, informational, and conservative in your triage.
    `;

    // 2. The Model: We use Llama 3 on Groq (Free and insanely fast)
    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile', 
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Here are my symptoms: ${symptoms}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const aiContent = response.choices[0].message.content;
    
    if (!aiContent) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(aiContent);

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process the request. Please try again later.' },
      { status: 500 }
    );
  }
}