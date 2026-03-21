import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { base64Image } = (await req.json()) as { base64Image?: string };
    if (!base64Image?.trim()) {
      return NextResponse.json({ error: "base64Image required" }, { status: 400 });
    }

    // Determine MIME type from base64 prefix or default to jpeg
    let mimeType = "image/jpeg";
    if (base64Image.startsWith("data:")) {
      const match = base64Image.match(/^data:(image\/\w+);base64,/);
      if (match) mimeType = match[1];
    }

    // Strip data URI prefix if present
    const base64Clean = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const res = await openai.chat.completions.create({
      model: "llama-3.2-90b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an empathetic medical assistant. The user uploaded a lab report. Extract key out-of-range values. Explain what they mean using simple analogies (e.g., 'cholesterol is like sludge in a pipe'). No complex jargon. Format your response as clean markdown with:
- A ## Summary section
- A ## Key Findings section with bullet points for each out-of-range value
- A ## What This Means section with simple analogies
- A ## Recommended Actions section
Be warm, encouraging and helpful.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Clean}`,
              },
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const markdown = res.choices[0].message.content || "Unable to analyze the report.";
    return NextResponse.json({ markdown });
  } catch (e) {
    console.error("Report explainer error:", e);
    return NextResponse.json({ error: "Failed to analyze report" }, { status: 500 });
  }
}
