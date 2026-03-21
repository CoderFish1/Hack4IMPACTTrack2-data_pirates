import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { base64Image, patientCondition } = (await req.json()) as {
      base64Image?: string;
      patientCondition?: string;
    };

    if (!base64Image?.trim()) {
      return NextResponse.json({ error: "base64Image required" }, { status: 400 });
    }

    // Determine MIME type from base64 prefix or default to jpeg
    let mimeType = "image/jpeg";
    if (base64Image.startsWith("data:")) {
      const match = base64Image.match(/^data:(image\/\w+);base64,/);
      if (match) mimeType = match[1];
    }

    const base64Clean = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const condition = patientCondition?.trim() || "No specific condition mentioned";

    const res = await openai.chat.completions.create({
      model: "llama-3.2-90b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert clinical dietician. Analyze this food image considering the patient's condition: "${condition}". Return valid JSON ONLY: { "foodIdentified": "Name of food", "estimatedCalories": "Number as string", "safeToEat": boolean, "recommendation": "Patient-friendly explanation of why they can or cannot eat it (2-3 sentences)", "alternatives": ["List", "of", "safer", "options"], "nutritionHighlights": { "protein": "High/Medium/Low", "carbs": "High/Medium/Low", "fat": "High/Medium/Low", "fiber": "High/Medium/Low" } }`,
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
      max_tokens: 1000,
    });

    const content = res.choices[0].message.content || "{}";
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const data = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");
    return NextResponse.json(data);
  } catch (e) {
    console.error("Food teller error:", e);
    return NextResponse.json({ error: "Failed to analyze food" }, { status: 500 });
  }
}
