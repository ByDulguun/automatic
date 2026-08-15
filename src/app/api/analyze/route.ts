import { NextRequest, NextResponse } from "next/server";
import { analyzeInputSchema } from "@/lib/schema";
import { runAnalysis, type ScreenshotInput } from "@/lib/analyze";
import {
  MAX_SCREENSHOTS,
  MAX_SCREENSHOT_BYTES,
  isAcceptedScreenshotType,
} from "@/lib/screenshot-constraints";

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const raw = {
    facebookUrl: form.get("facebookUrl")?.toString() ?? "",
    instagramUrl: form.get("instagramUrl")?.toString() ?? "",
    websiteUrl: form.get("websiteUrl")?.toString() ?? "",
    notes: form.get("notes")?.toString() ?? "",
    businessName: form.get("businessName")?.toString() ?? "",
    whatTheySell: form.get("whatTheySell")?.toString() ?? "",
    whatYouNotice: form.get("whatYouNotice")?.toString() ?? "",
  };

  const parsedInput = analyzeInputSchema.safeParse(raw);
  if (!parsedInput.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const files = form.getAll("screenshots").filter((v): v is File => v instanceof File && v.size > 0);

  if (files.length > MAX_SCREENSHOTS) {
    return NextResponse.json(
      { error: `Too many screenshots. Maximum is ${MAX_SCREENSHOTS}, received ${files.length}.` },
      { status: 400 }
    );
  }

  const screenshots: ScreenshotInput[] = [];
  for (const file of files) {
    if (!isAcceptedScreenshotType(file.type)) {
      return NextResponse.json(
        {
          error: `"${file.name}" has an unsupported file type (${file.type || "unknown"}). Only PNG, JPG, JPEG, and WEBP are allowed.`,
        },
        { status: 400 }
      );
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      return NextResponse.json(
        {
          error: `"${file.name}" is too large. Maximum size per screenshot is ${Math.round(
            MAX_SCREENSHOT_BYTES / (1024 * 1024)
          )}MB.`,
        },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    screenshots.push({
      base64: buffer.toString("base64"),
      mediaType: file.type,
      filename: file.name,
    });
  }

  const { facebookUrl, instagramUrl, websiteUrl, notes, businessName, whatTheySell, whatYouNotice } =
    parsedInput.data;
  if (
    !facebookUrl &&
    !instagramUrl &&
    !websiteUrl &&
    !notes &&
    !businessName &&
    !whatTheySell &&
    !whatYouNotice &&
    screenshots.length === 0
  ) {
    return NextResponse.json(
      { error: "Provide at least one URL, some business context, or a screenshot." },
      { status: 400 }
    );
  }

  const result = await runAnalysis(parsedInput.data, screenshots);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ data: result.data });
}
