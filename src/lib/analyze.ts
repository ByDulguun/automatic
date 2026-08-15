import Anthropic from "@anthropic-ai/sdk";
import { analysisResultSchema, type AnalysisResult, type AnalyzeInput } from "@/lib/schema";
import { extractHandle, fetchWebsiteData } from "@/lib/website-fetch";

const MODEL = "claude-sonnet-5";

const RESULT_TOOL_NAME = "submit_opportunity_analysis";

const RESULT_TOOL_SCHEMA = {
  name: RESULT_TOOL_NAME,
  description: "Submit the structured client opportunity analysis.",
  input_schema: {
    type: "object" as const,
    properties: {
      dataAvailability: {
        type: "object",
        properties: {
          website: { type: "boolean" },
          facebook: { type: "boolean" },
          instagram: { type: "boolean" },
          notes: { type: "boolean" },
        },
        required: ["website", "facebook", "instagram", "notes"],
      },
      dataLimitationsNote: {
        type: "string",
        description:
          "Plain statement of exactly which sources were actually available and which were not. Never claim access to private analytics, follower demographics, or login-only content.",
      },
      businessSnapshot: {
        type: "object",
        properties: {
          businessName: { type: "string" },
          industry: { type: "string" },
          businessType: { type: "string" },
          whatTheyOffer: { type: "string" },
          summary: { type: "string" },
        },
        required: ["businessName", "industry", "businessType", "whatTheyOffer", "summary"],
      },
      topOpportunity: {
        type: "object",
        description: "The single strongest opportunity only.",
        properties: {
          title: { type: "string" },
          whyItMatters: { type: "string" },
          recommendation: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 8 },
          priority: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
          expectedImpact: { type: "string" },
        },
        required: ["title", "whyItMatters", "recommendation", "priority", "expectedImpact"],
      },
      opportunities: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            priority: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
            possibleNeed: { type: "string" },
            why: { type: "string" },
            whatWeOffer: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 8 },
          },
          required: ["title", "priority", "possibleNeed", "why", "whatWeOffer"],
        },
      },
      bestOffer: {
        type: "object",
        properties: {
          name: { type: "string" },
          includes: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 8 },
          reason: { type: "string" },
          complexity: { type: "string", enum: ["Low", "Medium", "High"] },
        },
        required: ["name", "includes", "reason", "complexity"],
      },
      approach: {
        type: "object",
        properties: {
          whatToLeadWith: { type: "string" },
          openingMessage: {
            type: "string",
            description:
              "A short, natural, non-spammy outreach message written in Mongolian, suitable for sending on Facebook or Instagram.",
          },
        },
        required: ["whatToLeadWith", "openingMessage"],
      },
      insufficientData: {
        type: "boolean",
        description: "True only if the combined available data was too thin to produce a meaningful analysis.",
      },
    },
    required: [
      "dataAvailability",
      "dataLimitationsNote",
      "businessSnapshot",
      "topOpportunity",
      "opportunities",
      "bestOffer",
      "approach",
      "insufficientData",
    ],
  },
};

function buildPrompt(input: AnalyzeInput, website: Awaited<ReturnType<typeof fetchWebsiteData>>) {
  const facebookHandle = input.facebookUrl ? extractHandle(input.facebookUrl) : undefined;
  const instagramHandle = input.instagramUrl ? extractHandle(input.instagramUrl) : undefined;

  const lines: string[] = [];

  lines.push("You are an analyst for a small marketing/web agency, evaluating a potential client.");
  lines.push(
    "Your job is to infer what the business likely needs based ONLY on the information provided below, and recommend which of the agency's services to lead with."
  );
  lines.push("");
  lines.push("=== AVAILABLE INPUT DATA ===");

  lines.push(`Facebook URL provided: ${input.facebookUrl ? "yes" : "no"}`);
  if (input.facebookUrl) {
    lines.push(`  URL: ${input.facebookUrl}`);
    if (facebookHandle) lines.push(`  Handle/slug from URL: ${facebookHandle}`);
    lines.push(
      "  NOTE: The page's posts, follower count, and content could NOT be automatically retrieved (Facebook blocks unauthenticated scraping). Only the URL/handle above is known unless mentioned in business notes."
    );
  }

  lines.push(`Instagram URL provided: ${input.instagramUrl ? "yes" : "no"}`);
  if (input.instagramUrl) {
    lines.push(`  URL: ${input.instagramUrl}`);
    if (instagramHandle) lines.push(`  Handle/slug from URL: ${instagramHandle}`);
    lines.push(
      "  NOTE: The profile's posts, follower count, and content could NOT be automatically retrieved (Instagram blocks unauthenticated scraping). Only the URL/handle above is known unless mentioned in business notes."
    );
  }

  lines.push(`Website URL provided: ${input.websiteUrl ? "yes" : "no"}`);
  if (input.websiteUrl) {
    if (website.fetched) {
      lines.push(`  Website was successfully fetched.`);
      if (website.title) lines.push(`  Page title: ${website.title}`);
      if (website.metaDescription) lines.push(`  Meta description: ${website.metaDescription}`);
      if (website.textExcerpt) lines.push(`  Visible text excerpt:\n"""\n${website.textExcerpt}\n"""`);
    } else {
      lines.push(`  Website could NOT be fetched. Reason: ${website.error ?? "unknown error"}`);
      lines.push("  Do not describe website content — treat the website as unavailable.");
    }
  }

  lines.push(`Business notes provided by user: ${input.notes ? "yes" : "no"}`);
  if (input.notes) {
    lines.push(`"""\n${input.notes}\n"""`);
  }

  lines.push("");
  lines.push("=== RULES ===");
  lines.push(
    "1. Clearly separate OBSERVED information (things directly seen in the data above) from INFERRED opportunities (your educated guesses) and RECOMMENDATIONS (what the agency should offer)."
  );
  lines.push("2. NEVER claim access to private analytics, follower demographics, private posts, login-only content, or any data not actually provided above.");
  lines.push('3. If a source was not provided or could not be fetched, do not invent details about it. Say so plainly in dataLimitationsNote.');
  lines.push(
    "4. If the combined data is too thin to say anything meaningful (e.g. no sources at all, or all fetches failed and no notes given), set insufficientData to true, keep businessSnapshot minimal/honest, and keep opportunities generic but clearly labeled as low-confidence."
  );
  lines.push("5. Only ONE top opportunity — the single strongest one.");
  lines.push("6. Provide 3 to 5 items in opportunities.");
  lines.push("7. The opening outreach message must be written in natural, friendly Mongolian, short, and never sound like spam. It should reference something plausible about the business's actual public presence, not invented specifics.");
  lines.push("8. The agency offers: websites/ecommerce & product catalogs, content strategy & content plans, branding & visual identity, reels/video content & editing. Only recommend from within this general scope.");
  lines.push("9. Keep every field concise and actionable — this is a quick internal tool, not a long report.");
  lines.push("");
  lines.push(`Call the ${RESULT_TOOL_NAME} tool with the complete structured analysis.`);

  return lines.join("\n");
}

export type AnalyzeResult =
  | { ok: true; data: AnalysisResult }
  | { ok: false; error: string };

export async function runAnalysis(input: AnalyzeInput): Promise<AnalyzeResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error:
        "AI analysis is not configured. Add ANTHROPIC_API_KEY to your environment (.env.local) to enable it.",
    };
  }

  const website = input.websiteUrl
    ? await fetchWebsiteData(input.websiteUrl)
    : { fetched: false as const };

  const prompt = buildPrompt(input, website);

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      tools: [RESULT_TOOL_SCHEMA],
      tool_choice: { type: "tool", name: RESULT_TOOL_NAME },
      messages: [{ role: "user", content: prompt }],
    });

    const toolUse = message.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    if (!toolUse) {
      return { ok: false, error: "The AI response did not include a structured result." };
    }

    const parsed = analysisResultSchema.safeParse(toolUse.input);
    if (!parsed.success) {
      return { ok: false, error: "The AI response did not match the expected format." };
    }

    return { ok: true, data: parsed.data };
  } catch {
    return { ok: false, error: "The AI analysis request failed. Please try again." };
  }
}
