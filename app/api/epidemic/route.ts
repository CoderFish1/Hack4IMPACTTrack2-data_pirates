import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function GET() {
  try {
    const prompt = `You are an AI Hospital Administrator dashboard for a major Indian city (like Bhubaneswar, Delhi, or Mumbai) currently analyzing regional disease trends and exact blood bank inventory in real-time.
Provide a highly realistic, localized summary.
Return ONLY valid JSON matching this exact structure:
{
  "hospital_name": "AIIMS / Apollo / KIMS (Choose a realistic generic Indian hospital name context)",
  "overall_risk": "Low" | "Medium" | "High",
  "alerts": [
    {"disease": "Dengue Fever", "risk": "High", "region": "Local Wards", "note": "Post-monsoon spike, increase platelet reserves"},
    {"disease": "Typhoid", "risk": "Medium", "region": "City Outskirts", "note": "Waterborne cases rising"}
  ],
  "recommendation": "One sentence acting as a hospital admin directive.",
  "blood_inventory": [
    { "type": "O+", "units": 18, "status": "High" },
    { "type": "O-", "units": 2, "status": "Critical" },
    { "type": "A+", "units": 12, "status": "High" },
    { "type": "A-", "units": 4, "status": "Low" },
    { "type": "B+", "units": 9, "status": "Medium" },
    { "type": "B-", "units": 1, "status": "Critical" },
    { "type": "AB+", "units": 6, "status": "Medium" },
    { "type": "AB-", "units": 3, "status": "Low" }
  ],
  "last_updated": "Just now"
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
      hospital_name: "City General Hospital",
      overall_risk: "Medium",
      alerts: [
        { disease: "Dengue Fever", risk: "Medium", region: "Local District", note: "Monitor platelet stock." },
        { disease: "Influenza A", risk: "High", region: "City Center", note: "Seasonal uptick." },
      ],
      recommendation: "Ensure adequate ICU capacity. Monitor O- blood stock.",
      blood_inventory: [
        { type: "O+", units: 14, status: "High" },
        { type: "O-", units: 2, status: "Critical" },
        { type: "A+", units: 10, status: "High" },
        { type: "A-", units: 3, status: "Low" },
        { type: "B+", units: 8, status: "Medium" },
        { type: "B-", units: 2, status: "Critical" },
        { type: "AB+", units: 5, status: "Medium" },
        { type: "AB-", units: 1, status: "Critical" }
      ],
      last_updated: "Just now",
    });
  }
}
