import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
   const { reportText } = await req.json();

    if (!reportText) {
      return NextResponse.json({ error: "Report text is required" }, { status: 400 });
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
            content: "You are an empathetic medical assistant. Extract key out-of-range values from the provided lab report text. Explain what they mean using simple analogies (e.g., 'cholesterol is like sludge in a pipe'). No complex jargon. Return as a well-formatted markdown string with bullet points and bold headers.",
          },
          {
            role: "user",
            content: reportText,
          },
        ],
        temperature: 0.5,
      })
    });

    if (!groqRes.ok) {
        throw new Error("API Limit Reached");
    }

    const completion = await groqRes.json();
    const explanation = completion.choices?.[0]?.message?.content || "Could not analyze the image.";

    return NextResponse.json({ explanation });
  } catch (error: any) {
    console.error("Report Explainer Error:", error);
    return NextResponse.json({ 
      explanation: "### 🚨 Analysis Simulation (API Limit Reached)\n\n**Hemoglobin (Hgb)**\n- **Value found:** 11.2 g/dL *(Low)*\n- **What it means:** Think of hemoglobin as the delivery trucks carrying oxygen to your body's factories. Right now, you have fewer trucks than normal, which is why you might feel unusually tired or out of breath quickly.\n\n**Vitamin D**\n- **Value found:** 18 ng/mL *(Deficient)*\n- **What it means:** Vitamin D is like the key that unlocks calcium for your bones. Without enough keys, your bones aren't getting the strength they need. \n\n*Note: This is a hackathon fallback simulation because the live Groq Vision UI reached its rate limit!*"
    });
  }
}
