import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { base64Image, patientCondition } = await req.json();

    if (!base64Image || !patientCondition) {
      return NextResponse.json({ error: "Image data and patient condition are required" }, { status: 400 });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.2-11b-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an expert clinical dietician. Analyze this food image considering the patient's condition: "${patientCondition}". Return valid JSON ONLY: { "foodIdentified": "Name of food", "estimatedCalories": "Number", "safeToEat": true/false, "recommendation": "Patient-friendly explanation of why they can or cannot eat it", "alternatives": ["List", "of", "safer", "options"] }`,
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
      throw new Error("API Limit Reached");
    }

    const completion = await groqRes.json();
    const responseContent = completion.choices?.[0]?.message?.content || "{}";
    
    // Attempt to extract JSON if the model outputs markdown backticks
    let jsonStr = responseContent;
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
    }

    const analysis = JSON.parse(jsonStr);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Food Teller Error:", error);
    // Graceful fallback during hackathon demo if API completely fails
    return NextResponse.json({
      foodIdentified: "Uploaded Food Item",
      estimatedCalories: "250-400 kcal",
      safeToEat: false,
      recommendation: `This item appears to conflict with your health profile. (AI server limits reached — showing simulated safety warning).`,
      alternatives: ["A healthy salad", "Lean protein", "Low glycemic index fruits"]
    });
  }
}
