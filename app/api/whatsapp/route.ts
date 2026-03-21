import { NextResponse } from 'next/server';

interface AIResult {
  possible_conditions: string[];
  precautions: string[];
  recommendation_level: 'Self-Care' | 'Consult Doctor' | 'Urgent Care';
  specialist_debate: { role: string; insight: string }[];
  medication_warning?: string | null;
}

interface WhatsAppRequestBody {
  to: string;
  emergencyTo?: string;
  result: AIResult;
  symptoms: string;
  hasDDI: boolean;
}

function formatClinicalMessage(result: AIResult, symptoms: string, hasDDI: boolean): string {
  const lines: string[] = [];

  // ⚠️ CRITICAL MED-SAFE WARNING prefix if DDI detected
  if (hasDDI && result.medication_warning) {
    lines.push(`⚠️ *CRITICAL MED-SAFE WARNING*`);
    lines.push(`🔴 ${result.medication_warning}`);
    lines.push('');
  }

  // Header
  lines.push(`🏥 *MED-AI CLINICAL SBAR REPORT*`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push('');

  // Situation
  lines.push(`*📋 SITUATION*`);
  lines.push(`_${symptoms}_`);
  lines.push('');

  // Assessment — Triage Level
  const triageEmoji =
    result.recommendation_level === 'Urgent Care' ? '🔴' :
    result.recommendation_level === 'Consult Doctor' ? '🟡' : '🟢';

  lines.push(`*⚡ TRIAGE LEVEL: ${result.recommendation_level.toUpperCase()}* ${triageEmoji}`);
  lines.push('');

  // Possible Conditions
  if (result.possible_conditions?.length) {
    lines.push(`*🔬 POTENTIAL CONDITIONS*`);
    result.possible_conditions.forEach((c) => lines.push(`  • ${c}`));
    lines.push('');
  }

  // Specialist Debate (Italic)
  if (result.specialist_debate?.length) {
    lines.push(`*👨‍⚕️ SPECIALIST OBSERVATIONS*`);
    result.specialist_debate.forEach((s) => {
      lines.push(`_${s.role}: ${s.insight.replace(/\n/g, ' ')}_`);
    });
    lines.push('');
  }

  // Action Plan
  if (result.precautions?.length) {
    lines.push(`*📌 ACTION PLAN*`);
    result.precautions.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
    lines.push('');
  }

  // Urgent Care footer
  if (result.recommendation_level === 'Urgent Care') {
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`🚨 *URGENT CARE REQUIRED* — Please proceed to the nearest emergency room or call 112 immediately.`);
    lines.push('');
  }

  lines.push(`_Sent by MED-AI Clinical System | ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}_`);

  return lines.join('\n');
}

async function sendWhatsAppMessage(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('[WhatsApp] Twilio credentials not configured – message not sent.');
    return false;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const formData = new URLSearchParams();
  formData.append('From', `whatsapp:${fromNumber}`);
  formData.append('To',   `whatsapp:${to}`);
  formData.append('Body', body);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    return res.ok;
  } catch (err) {
    console.error('[WhatsApp] Send failed:', err);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const { to, emergencyTo, result, symptoms, hasDDI }: WhatsAppRequestBody = await req.json();

    if (!to || !result) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const messageBody = formatClinicalMessage(result, symptoms, hasDDI);

    // Primary dispatch to patient
    const patientSent = await sendWhatsAppMessage(to, messageBody);

    // Dual-dispatch: Emergency contact only on Urgent Care
    let emergencySent = false;
    if (result.recommendation_level === 'Urgent Care' && emergencyTo) {
      const emergencyMessage =
        `🚨 *GUARDIAN ALERT — Amrit*\n\n` +
        `Your linked patient has an *URGENT CARE* triage result.\n\n` +
        messageBody;
      emergencySent = await sendWhatsAppMessage(emergencyTo, emergencyMessage);
    }

    return NextResponse.json({
      success: true,
      patientSent,
      emergencySent,
      messageBody,
      credentialsConfigured: !!(
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_WHATSAPP_FROM &&
        !process.env.TWILIO_ACCOUNT_SID.includes('ACxxx')
      ),
    });
  } catch (error) {
    console.error('[WhatsApp Route] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
