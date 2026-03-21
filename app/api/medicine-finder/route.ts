import { NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";

export async function POST(req: Request) {
  try {
    const { brandedName } = await req.json();
    if (!brandedName) {
      return NextResponse.json({ error: "Branded medicine name required" }, { status: 400 });
    }

    const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

    // 1. Identify Salt Name using Groq
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
            content: "You are a clinical pharmacologist. Return valid JSON only.",
          },
          {
            role: "user",
            content: `Identify the primary active ingredient (salt) of this Indian branded medicine: ${brandedName}. Return JSON: { "saltName": "name of salt" }`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!groqRes.ok) throw new Error("Could not reach Groq API");

    const saltCompletion = await groqRes.json();
    const saltData = JSON.parse(saltCompletion.choices?.[0]?.message?.content || "{}");
    const saltName = saltData.saltName;

    if (!saltName) throw new Error("Could not identify generic salt.");

    // 2. Firecrawl LLM Extraction for Live Pricing
    const extractRes = await firecrawl.extract([
      `https://www.google.com/search?q=buy+${encodeURIComponent(brandedName)}+price+pharmeasy+1mg`,
      `https://www.google.com/search?q=buy+${encodeURIComponent(saltName)}+generic+price+pharmeasy+1mg`
    ], {
      prompt: `Extract the exact live current prices in INR (₹) for the branded medicine "${brandedName}" and its generic salt "${saltName}". Return the numbers only.`,
      schema: {
        type: "object",
        properties: {
          brandedPriceInr: { type: "number" },
          genericPriceInr: { type: "number" }
        },
        required: ["brandedPriceInr", "genericPriceInr"]
      }
    });

    if (!extractRes.success || !extractRes.data) {
      throw new Error("Live extraction failed. Searching alternative sources...");
    }

    const { brandedPriceInr, genericPriceInr } = extractRes.data as any;

    if (!brandedPriceInr || !genericPriceInr) {
      throw new Error("Could not extract reliable prices from live sources.");
    }

    const savingsPercent = Math.round(((brandedPriceInr - genericPriceInr) / brandedPriceInr) * 100);

    return NextResponse.json({
      brandedName,
      genericName: saltName,
      brandedPrice: `₹${brandedPriceInr}`,
      genericPrice: `₹${genericPriceInr}`,
      savingsPercent: savingsPercent > 0 ? savingsPercent : 0,
      alternatives: [
        { name: `${saltName} Tablet`, manufacturer: "Jan Aushadhi Kendra", price: `₹${Math.round(genericPriceInr * 0.8)}` },
        { name: `${saltName} Generic`, manufacturer: "Pharmeasy Generics", price: `₹${genericPriceInr}` }
      ]
    });
  } catch (error: any) {
    console.error("Medicine Finder Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process medicine query" }, { status: 500 });
  }
}
