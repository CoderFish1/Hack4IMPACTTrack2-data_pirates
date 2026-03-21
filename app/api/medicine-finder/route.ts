import { NextResponse } from "next/server";
import OpenAI from "openai";
import FirecrawlApp from "@mendable/firecrawl-js";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { brandedName } = (await req.json()) as { brandedName?: string };
    if (!brandedName?.trim()) {
      return NextResponse.json({ error: "brandedName required" }, { status: 400 });
    }

    // Step 1: Identify the salt using Groq
    const saltRes = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Identify the primary active ingredient (salt) of this Indian branded medicine: "${brandedName}". Return JSON: { "saltName": "name of salt", "strength": "common strength e.g. 500mg", "category": "e.g. painkiller, antibiotic" }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const saltInfo = JSON.parse(saltRes.choices[0].message.content || "{}");
    const saltName = saltInfo.saltName || brandedName;

    // Step 2: Try Firecrawl for live price scraping
    let scrapedData = null;
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;

    if (firecrawlKey) {
      try {
        const firecrawl = new FirecrawlApp({ apiKey: firecrawlKey });
        const searchResult = await firecrawl.search(
          `${brandedName} vs generic ${saltName} price India Jan Aushadhi`,
          {
            limit: 3,
            scrapeOptions: { formats: ["markdown"] },
          }
        );

        if (searchResult.success && searchResult.data?.length) {
          const combinedContent = searchResult.data
            .map((r: { markdown?: string }) => r.markdown || "")
            .join("\n\n")
            .slice(0, 4000);

          // Use Groq to extract prices from scraped content
          const extractRes = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: `You are a pharmaceutical price analyst. From this web content about "${brandedName}" (salt: ${saltName}), extract REAL prices. Content:\n${combinedContent}\n\nReturn JSON: { "brandedPrice": "₹XX per strip", "genericPrice": "₹XX per strip", "brandedPriceNum": number, "genericPriceNum": number, "source": "website name where price was found" }. If you cannot find exact prices, estimate based on typical Indian pharmacy pricing for this drug.`,
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
          });

          scrapedData = JSON.parse(extractRes.choices[0].message.content || "{}");
        }
      } catch (e) {
        console.error("Firecrawl error:", e);
      }
    }

    // Step 3: Final comprehensive response via Groq
    const priceContext = scrapedData
      ? `Live scraped data: Branded price = ${scrapedData.brandedPrice}, Generic price = ${scrapedData.genericPrice}, Source = ${scrapedData.source}.`
      : "No live price data available. Use your knowledge of typical Indian pharmacy pricing.";

    const finalRes = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a Jan Aushadhi generic medicine expert in India.
Medicine: "${brandedName}" (Salt: ${saltName}, Strength: ${saltInfo.strength || "standard"}, Category: ${saltInfo.category || "medicine"})
${priceContext}

Return ONLY valid JSON:
{
  "brandedName": "Full branded name",
  "saltName": "${saltName}",
  "strength": "${saltInfo.strength || "standard"}",
  "brandedPrice": "₹XX per strip/unit",
  "genericPrice": "₹XX per strip/unit (Jan Aushadhi price)",
  "savingsPercent": number between 0-95,
  "janAushadhiAvailable": true/false,
  "alternatives": [
    { "name": "Generic brand name", "price": "₹XX", "manufacturer": "Company" }
  ],
  "source": "where price data originates",
  "disclaimer": "One-line medical disclaimer"
}

Be accurate with Indian pricing. Jan Aushadhi generics are typically 50-90% cheaper.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const data = JSON.parse(finalRes.choices[0].message.content || "{}");
    return NextResponse.json(data);
  } catch (e) {
    console.error("Medicine finder error:", e);
    return NextResponse.json({ error: "Failed to find medicine data" }, { status: 500 });
  }
}
