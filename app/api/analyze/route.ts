import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY, 
  baseURL: "https://api.groq.com/openai/v1", 
});

async function chooseSpecialists(symptoms: string, background: string[]) {
  const pickerPrompt = `You are a clinical orchestrator.
Choose the 3 most relevant medical specialist roles for this case.
Symptoms: "${symptoms}"
Background: ${background.length > 0 ? background.join(", ") : "None"}

Return ONLY valid JSON:
{
  "specialists": ["Role 1", "Role 2", "Role 3"]
}

Rules:
- Must be exactly 3 roles
- Use specific roles (e.g., Cardiologist, Pulmonologist, Infectious Disease Specialist, Neurologist)
- Avoid duplicates`;

  const response = await openai.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: pickerPrompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const parsed = JSON.parse(response.choices[0].message.content || "{}") as { specialists?: string[] };
  const shortlist = (parsed.specialists || [])
    .map((s) => s?.trim())
    .filter((s): s is string => Boolean(s))
    .slice(0, 3);

  if (shortlist.length === 3) return shortlist;
  return ["Cardiologist", "Neurologist", "General Practitioner"];
}

async function getSpecialistOpinion(role: string, symptoms: string, background: string[], medications: string[]) {
  const systemPrompt = `You are a world-class ${role}. 
  Symptoms: "${symptoms}". 
  Background: ${background.length > 0 ? background.join(", ") : "None"}.
  Current Medications: ${medications.length > 0 ? medications.join(", ") : "None"}.
  
  Provide a brief (max 2 sentences) clinical observation from your specific specialty. Do not diagnose, only observe.`;

  const response = await openai.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: systemPrompt }],
    temperature: 0.3,
  });
  return { role, insight: response.choices[0].message.content || "Observation unavailable." };
}

// 👉 NEW: The Pharmacist Agent
async function getPharmacistOpinion(medications: string[], background: string[]) {
  if (medications.length === 0) return null;

  const systemPrompt = `You are a strict Clinical Pharmacist. 
  The patient is currently taking: ${medications.join(", ")}.
  Pre-existing conditions: ${background.length > 0 ? background.join(", ") : "None"}.
  
  Identify ANY known drug-drug interactions between these medications, or contraindications with their conditions. 
  If safe, reply "No major interactions detected." If dangerous, start with "CRITICAL WARNING:". Keep it under 2 sentences.`;

  const response = await openai.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: systemPrompt }],
    temperature: 0.1, // Highly precise
  });
  return response.choices[0].message.content;
}

export async function POST(req: Request) {
  try {
    const { symptoms, background, medications } = await req.json();
    if (!symptoms) return NextResponse.json({ error: 'Symptoms required' }, { status: 400 });

    const selectedSpecialists = await chooseSpecialists(symptoms, background || []);

    // Run 4 Agents in Parallel
    const [specA, specB, specC, pharmaInsight] = await Promise.all([
      getSpecialistOpinion(selectedSpecialists[0], symptoms, background, medications),
      getSpecialistOpinion(selectedSpecialists[1], symptoms, background, medications),
      getSpecialistOpinion(selectedSpecialists[2], symptoms, background, medications),
      getPharmacistOpinion(medications || [], background || [])
    ]);

    const specialistInsights = [specA, specB, specC];

    const consensusPrompt = `
      You are a Chief Medical Officer. Review these insights:
      ${specialistInsights.map(s => `${s.role}: ${s.insight}`).join('\n')}
      Pharmacist Warning: ${pharmaInsight || "None"}

      Patient Symptoms: "${symptoms}"
      
      Return ONLY a valid JSON object matching this structure:
      {
        "possible_conditions": ["Condition 1", "Condition 2"],
        "precautions": ["Actionable tip 1", "Actionable tip 2"],
        "recommendation_level": "Self-Care" | "Consult Doctor" | "Urgent Care",
        "specialist_debate": [
          {"role": "${selectedSpecialists[0]}", "insight": "..."},
          {"role": "${selectedSpecialists[1]}", "insight": "..."},
          {"role": "${selectedSpecialists[2]}", "insight": "..."}
        ],
        "medication_warning": "${pharmaInsight ? 'Include the pharmacist warning here if it starts with CRITICAL, else null' : 'null'}"
      }
    `;

    const finalResponse = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: consensusPrompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const data = JSON.parse(finalResponse.choices[0].message.content || "{}");
    
    // Force inject the pharmacist warning if the AI missed it
    if (pharmaInsight && pharmaInsight.includes("CRITICAL WARNING")) {
      data.medication_warning = pharmaInsight;
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}