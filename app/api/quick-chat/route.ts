import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // We only use the last few messages to limit payload size
    const recent = messages.slice(-8).map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }));

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a preliminary health assistant embedded on a medical analytics platform called "Sanjiivani Lifeline". Your role is to:
1. Briefly acknowledge the user's symptoms
2. Give a quick preliminary assessment (1-2 sentences)
3. Mention whether they should seek immediate emergency care OR monitor symptoms and visit a doctor
4. Gently but clearly remind them that for a full specialist AI triage (with cardiology, neurology, and general medicine AI agents, medical history context, and SBAR reports), they should log in as a patient. 
Keep responses short — maximum 4 sentences. Be empathetic, professional, and concise. Never refuse to help.`,
          },
          ...recent,
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      throw new Error("Groq API failed");
    }

    const completion = await groqRes.json();
    const reply = completion.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Quick chat error:", error);
    return NextResponse.json({
      reply: "I'm having trouble connecting right now. For immediate health questions, please seek medical attention. To use our full AI triage system, [log in here](/login).",
    });
  }
}
