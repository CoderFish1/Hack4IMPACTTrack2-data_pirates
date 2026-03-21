import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { foodText, patientCondition, mealType } = await req.json();

    if (!foodText || !patientCondition) {
      return NextResponse.json({ error: "Food text and patient condition are required" }, { status: 400 });
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
            content: `You are an expert clinical dietician. Evaluate the user's food meal against their medical condition: "${patientCondition}". They are eating this for: "${mealType || 'General Meal'}". Return valid JSON ONLY: { "foodIdentified": "Cleaned name of food", "estimatedCalories": "Number", "safeToEat": true/false, "recommendation": "Patient-friendly explanation of why they can or cannot eat it", "whatToEatInstead": ["List", "of", "specific", "full meals", "to eat instead"], "whenToEat": "Detailed info on the best time of day to eat this specific meal based on their condition (e.g. 'Eat this 2 hours before a workout' or 'Avoid eating this past 6 PM due to acid reflux')", "nutritionHighlights": {"protein":"10g", "carbs":"20g", "fat":"5g", "fiber":"3g"} }`,
          },
          {
            role: "user",
            content: foodText,
          },
        ],
        temperature: 0.5,
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
