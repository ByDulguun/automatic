import Anthropic from "@anthropic-ai/sdk";
import { analysisResultSchema, type AnalysisResult, type AnalyzeInput } from "@/lib/schema";
import { extractHandle, fetchWebsiteData } from "@/lib/website-fetch";
import type { AcceptedScreenshotType } from "@/lib/screenshot-constraints";

const MODEL = "claude-sonnet-5";

const RESULT_TOOL_NAME = "submit_opportunity_analysis";

export type ScreenshotInput = {
  base64: string;
  mediaType: AcceptedScreenshotType;
  filename: string;
};

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
          screenshots: { type: "boolean" },
        },
        required: ["website", "facebook", "instagram", "notes", "screenshots"],
      },
      dataLimitationsNote: {
        type: "string",
        description:
          "Plain statement of exactly which sources were actually available and which were not. Never claim access to private analytics, follower demographics, or login-only content, or to having scraped Facebook/Instagram automatically.",
      },
      observations: {
        type: "array",
        maxItems: 8,
        description:
          "Neutral, directly-observed facts only — things literally visible in the screenshots, website text, or explicitly stated in notes. No interpretation or opinion here.",
        items: {
          type: "object",
          properties: {
            text: { type: "string" },
            source: { type: "string", enum: ["screenshot", "website", "notes"] },
          },
          required: ["text", "source"],
        },
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
          confidence: {
            type: "string",
            enum: ["High", "Medium", "Low"],
            description:
              "High = clearly visible in screenshots or website data. Medium = strongly suggested by available info. Low = limited evidence.",
          },
          expectedImpact: { type: "string" },
        },
        required: ["title", "whyItMatters", "recommendation", "priority", "confidence", "expectedImpact"],
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
            confidence: { type: "string", enum: ["High", "Medium", "Low"] },
            possibleNeed: { type: "string" },
            why: { type: "string" },
            whatWeOffer: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 8 },
          },
          required: ["title", "priority", "confidence", "possibleNeed", "why", "whatWeOffer"],
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
      "observations",
      "businessSnapshot",
      "topOpportunity",
      "opportunities",
      "bestOffer",
      "approach",
      "insufficientData",
    ],
  },
};

function buildPrompt(
  input: AnalyzeInput,
  website: Awaited<ReturnType<typeof fetchWebsiteData>>,
  screenshotCount: number
) {
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
      "  NOTE: The page's posts, follower count, and content could NOT be automatically retrieved (Facebook blocks unauthenticated scraping). Only the URL/handle above is known unless mentioned in business notes or shown in a user-provided screenshot below."
    );
  }

  lines.push(`Instagram URL provided: ${input.instagramUrl ? "yes" : "no"}`);
  if (input.instagramUrl) {
    lines.push(`  URL: ${input.instagramUrl}`);
    if (instagramHandle) lines.push(`  Handle/slug from URL: ${instagramHandle}`);
    lines.push(
      "  NOTE: The profile's posts, follower count, and content could NOT be automatically retrieved (Instagram blocks unauthenticated scraping). Only the URL/handle above is known unless mentioned in business notes or shown in a user-provided screenshot below."
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

  lines.push(`Business name (as told by the agency staff member): ${input.businessName ? "yes" : "no"}`);
  if (input.businessName) lines.push(`  "${input.businessName}"`);

  lines.push(`What the business sells/offers (as told by the agency staff member): ${input.whatTheySell ? "yes" : "no"}`);
  if (input.whatTheySell) lines.push(`"""\n${input.whatTheySell}\n"""`);

  lines.push(`What the staff member noticed about the current page(s): ${input.whatYouNotice ? "yes" : "no"}`);
  if (input.whatYouNotice) lines.push(`"""\n${input.whatYouNotice}\n"""`);

  lines.push(`Business notes provided by user: ${input.notes ? "yes" : "no"}`);
  if (input.notes) {
    lines.push(`"""\n${input.notes}\n"""`);
  }

  lines.push(`User-provided screenshots attached: ${screenshotCount > 0 ? `yes (${screenshotCount})` : "no"}`);
  if (screenshotCount > 0) {
    lines.push(
      "  These screenshots were manually captured by an agency staff member visiting the business's Facebook/Instagram/website — they were NOT scraped automatically. Analyze only what is visibly shown in them (profile presentation, bio clarity, visual consistency, branding, product presentation, content variety, CTA visibility, posting style, reel presence, overall professionalism, potential conversion problems). Do not assume anything about content that is not visible in the images."
    );
  }

  lines.push("");
  lines.push("=== RULES ===");
  lines.push(
    "1. Clearly separate three layers: OBSERVED information (put these in the observations array — neutral facts literally visible in screenshots/website/notes, each tagged with its source), INFERRED opportunities (your educated guesses, in topOpportunity/opportunities), and RECOMMENDATIONS (what the agency should offer, in the whatWeOffer/recommendation/bestOffer fields)."
  );
  lines.push("2. NEVER claim access to private analytics, follower demographics, private posts, login-only content, or any data not actually provided above. Never claim Facebook or Instagram content was scraped automatically — screenshots, if any, were manually provided by staff.");
  lines.push('3. If a source was not provided or could not be fetched, do not invent details about it. Say so plainly in dataLimitationsNote.');
  lines.push(
    "4. If the combined data is too thin to say anything meaningful (e.g. no sources at all, or all fetches failed and no notes/screenshots given), set insufficientData to true, keep businessSnapshot minimal/honest, and keep opportunities generic with Low confidence."
  );
  lines.push(
    "5. Assign a confidence to topOpportunity and each opportunity: High = clearly visible in screenshots or website data, Medium = strongly suggested by available information, Low = limited evidence."
  );
  lines.push("6. Only ONE top opportunity — the single strongest one.");
  lines.push("7. Provide 3 to 5 items in opportunities.");
  lines.push("8. The opening outreach message must be written in natural, friendly Mongolian, short, and never sound like spam. It should reference something plausible about the business's actual public presence, not invented specifics.");
  lines.push("9. The agency offers: websites/ecommerce & product catalogs, content strategy & content plans, branding & visual identity, reels/video content & editing. Only recommend from within this general scope.");
  lines.push("10. Keep every field concise and actionable — this is a quick internal tool, not a long report.");
  lines.push("");
  lines.push(`Call the ${RESULT_TOOL_NAME} tool with the complete structured analysis.`);

  return lines.join("\n");
}

export type AnalyzeResult =
  | { ok: true; data: AnalysisResult }
  | { ok: false; error: string };

export async function runAnalysis(
  input: AnalyzeInput,
  screenshots: ScreenshotInput[] = []
): Promise<AnalyzeResult> {
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

  const prompt = buildPrompt(input, website, screenshots.length);

  const client = new Anthropic({ apiKey });

  const content: Anthropic.ContentBlockParam[] = [];

  if (screenshots.length > 0) {
    content.push({
      type: "text",
      text: "The following images are user-provided screenshots (manually captured by agency staff, not scraped).",
    });
    for (const shot of screenshots) {
      content.push({
        type: "image",
        source: { type: "base64", media_type: shot.mediaType, data: shot.base64 },
      });
    }
  }

  content.push({ type: "text", text: prompt });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      tools: [RESULT_TOOL_SCHEMA],
      tool_choice: { type: "tool", name: RESULT_TOOL_NAME },
      messages: [{ role: "user", content }],
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
