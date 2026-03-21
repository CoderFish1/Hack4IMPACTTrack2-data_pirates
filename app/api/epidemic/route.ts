import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function GET() {
  try {
    const prompt = `You are an epidemiologist AI analyzing global and seasonal disease trends right now (early 2026).
Provide a concise epidemic risk summary for hospital administrators.
Return ONLY JSON:
{
  "overall_risk": "Low|Medium|High",
  "alerts": [
    {"disease": "Influenza A", "risk": "High", "region": "Northern Hemisphere", "note": "Peak season active"},
    {"disease": "Dengue", "risk": "Medium", "region": "South Asia", "note": "Elevated cases post-monsoon"},
    {"disease": "RSV", "risk": "Medium", "region": "Global", "note": "Uptick in pediatric admissions"}
  ],
  "recommendation": "Ensure adequate ICU capacity and PPE stock. Increase flu vaccination outreach for elderly patients.",
  "last_updated": "2026-03-21"
}`;

    const res = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const data = JSON.parse(res.choices[0].message.content || "{}");
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      overall_risk: "Medium",
      alerts: [
        { disease: "Influenza A", risk: "High", region: "Northern Hemisphere", note: "Peak season – monitor ICU admissions." },
        { disease: "Dengue", risk: "Medium", region: "South Asia", note: "Post-monsoon spike expected." },
      ],
      recommendation: "Maintain PPE stock. Increase seasonal vaccination outreach.",
      last_updated: "2026-03-21",
    });
  }
}
