import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { base64Image } = await req.json();

    if (!base64Image) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-90b-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "You are an empathetic medical assistant. The user uploaded a lab report. Extract key out-of-range values. Explain what they mean using simple analogies (e.g., 'cholesterol is like sludge in a pipe'). No complex jargon. Return as a well-formatted markdown string with bullet points and bold headers.",
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Image,
                },
              },
            ],
          },
        ],
        max_tokens: 1024,
        temperature: 0.5,
        top_p: 1
      })
    });

    if (!groqRes.ok) {
        throw new Error("Failed to connect to Groq Vision API");
    }

    const completion = await groqRes.json();
    const explanation = completion.choices?.[0]?.message?.content || "Could not analyze the image.";

    return NextResponse.json({ explanation });
  } catch (error: any) {
    console.error("Report Explainer Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze report" }, { status: 500 });
  }
}
