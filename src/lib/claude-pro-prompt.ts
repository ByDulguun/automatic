import type { AnalyzeInput } from "@/lib/schema";

function extractHandle(url: string): string | undefined {
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments[0] ?? undefined;
  } catch {
    return undefined;
  }
}

export function buildManualClaudePrompt(
  input: AnalyzeInput,
  screenshotCount: number,
  screenshotNames: string[] = []
): string {
  const lines: string[] = [];

  lines.push(
    "You are acting as an analyst for a small marketing/web agency, evaluating a potential client business."
  );
  lines.push(
    "I have manually attached screenshots of this business directly to this conversation (Facebook, Instagram, posts, reels, and/or website). Analyze ONLY what is visible in the attached screenshots and the information below — do not assume or invent anything you cannot see or that isn't stated here."
  );
  lines.push("");
  lines.push("=== BUSINESS INFORMATION ===");
  lines.push(`Business Name: ${input.businessName || "Not provided"}`);

  const facebookHandle = input.facebookUrl ? extractHandle(input.facebookUrl) : undefined;
  lines.push(
    `Facebook URL: ${input.facebookUrl || "Not provided"}${facebookHandle ? ` (handle: ${facebookHandle})` : ""}`
  );

  const instagramHandle = input.instagramUrl ? extractHandle(input.instagramUrl) : undefined;
  lines.push(
    `Instagram URL: ${input.instagramUrl || "Not provided"}${instagramHandle ? ` (handle: ${instagramHandle})` : ""}`
  );

  lines.push(`Website URL: ${input.websiteUrl || "Not provided"}`);
  lines.push("");
  lines.push(`What this business sells/offers: ${input.whatTheySell || "Not provided"}`);
  lines.push(`What I noticed about their current page: ${input.whatYouNotice || "Not provided"}`);
  lines.push(`Additional notes: ${input.notes || "Not provided"}`);
  lines.push("");

  if (screenshotCount > 0) {
    lines.push(
      `Screenshots attached: ${screenshotCount}${screenshotNames.length ? ` (${screenshotNames.join(", ")})` : ""}`
    );
    lines.push("Upload the screenshots manually into Claude before sending this prompt.");
  } else {
    lines.push("Screenshots attached: none — base the analysis only on the information above.");
  }

  lines.push("");
  lines.push("=== YOUR TASK ===");
  lines.push(
    "Analyze this business and return your findings using EXACTLY the following 7 sections, in this order, with these exact headings:"
  );
  lines.push("");
  lines.push("1. BUSINESS SNAPSHOT");
  lines.push("Business Name, Industry, Business Model, What They Offer, and a short Current Situation summary.");
  lines.push("");
  lines.push("2. WHAT WE CAN SEE");
  lines.push(
    "Neutral, directly observed facts only — things literally visible in the screenshots or explicitly stated above. Tag each with its source (screenshot / website / notes). No interpretation or opinion here."
  );
  lines.push("");
  lines.push("3. TOP OPPORTUNITY");
  lines.push(
    "The single strongest opportunity only. Include: title, why it matters, our recommendation (bulleted), priority (HIGH/MEDIUM/LOW), confidence (High/Medium/Low), and expected impact."
  );
  lines.push("");
  lines.push("4. WHAT THEY MAY NEED");
  lines.push(
    "3 to 5 additional opportunities. For each: title, priority, confidence, possible need, why, and what we can offer (bulleted)."
  );
  lines.push("");
  lines.push("5. OUR BEST OFFER");
  lines.push(
    "The single package this agency should lead with: name, what it includes (bulleted), reason, and estimated project complexity (Low/Medium/High)."
  );
  lines.push("");
  lines.push("6. HOW TO APPROACH THIS CLIENT");
  lines.push(
    "What to lead with — a short paragraph on framing and strategy. Do not immediately pitch a specific service."
  );
  lines.push("");
  lines.push("7. PERSONALIZED MONGOLIAN OPENING MESSAGE");
  lines.push(
    "A short, natural, friendly outreach message written in Mongolian, suitable for sending on Facebook or Instagram. Reference something plausible about the business's actual public presence — never invented specifics — and never sound like spam."
  );
  lines.push("");
  lines.push("=== RULES ===");
  lines.push(
    "1. Clearly separate OBSERVED information (section 2) from INFERRED opportunities (sections 3-4) and RECOMMENDATIONS (sections 3-5)."
  );
  lines.push(
    "2. Never claim to have accessed private analytics, follower demographics, private posts, or login-only content — use only what is visible in the attached screenshots or stated above."
  );
  lines.push("3. If something was not provided or is not visible, say so plainly rather than guessing.");
  lines.push(
    '4. If the combined information is too thin to say anything meaningful, say "Insufficient public information" and keep the analysis honest and low-confidence rather than inventing detail.'
  );
  lines.push(
    "5. The agency offers: websites/ecommerce & product catalogs, content strategy & content plans, branding & visual identity, and reels/video content & editing. Only recommend within this scope."
  );
  lines.push("6. Keep the analysis concise and actionable — this is a quick internal tool, not a long report.");

  return lines.join("\n");
}
