import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { forwardedMessage } = await req.json();

    if (!forwardedMessage) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a strict, highly clinical medical fact-checker. Analyze the user's forwarded message for medical accuracy. Reply ONLY with valid JSON.",
          },
          {
            role: "user",
            content: `Analyze this claim: "${forwardedMessage}". Respond in valid JSON: { "status": "FAKE" | "TRUE" | "NEEDS CONTEXT", "explanation": "A 2-sentence simple explanation.", "dangerLevel": "High" | "Medium" | "Low" }`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!groqRes.ok) throw new Error("Failed to connect to Groq API.");

    const completion = await groqRes.json();
    const analysis = JSON.parse(completion.choices?.[0]?.message?.content || "{}");

    if (!analysis.status || !analysis.explanation) {
      throw new Error("Failed to parse fact-check result.");
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Myth Buster Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze message" }, { status: 500 });
  }
}
