import { NextRequest, NextResponse } from "next/server";
import { analyzeInputSchema } from "@/lib/schema";
import { runAnalysis } from "@/lib/analyze";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsedInput = analyzeInputSchema.safeParse(body);
  if (!parsedInput.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { facebookUrl, instagramUrl, websiteUrl, notes } = parsedInput.data;
  if (!facebookUrl && !instagramUrl && !websiteUrl && !notes) {
    return NextResponse.json(
      { error: "Provide at least one URL or a business note." },
      { status: 400 }
    );
  }

  const result = await runAnalysis(parsedInput.data);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ data: result.data });
}
