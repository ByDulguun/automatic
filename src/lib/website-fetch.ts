export type WebsiteData = {
  fetched: boolean;
  title?: string;
  metaDescription?: string;
  textExcerpt?: string;
  error?: string;
};

const FETCH_TIMEOUT_MS = 8000;
const MAX_TEXT_LENGTH = 4000;

function extractTag(html: string, tag: string): string | undefined {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match?.[1]?.trim();
}

function extractMeta(html: string, name: string): string | undefined {
  const match = html.match(
    new RegExp(
      `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`,
      "i"
    )
  );
  return match?.[1]?.trim();
}

function stripToText(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const withoutTags = withoutScripts.replace(/<[^>]+>/g, " ");
  return withoutTags.replace(/\s+/g, " ").trim();
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

export async function fetchWebsiteData(rawUrl: string): Promise<WebsiteData> {
  const url = normalizeUrl(rawUrl);
  if (!url) return { fetched: false, error: "No URL provided" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ClientOpportunityAnalyzer/1.0; +internal-tool)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      return { fetched: false, error: `Website responded with status ${res.status}` };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return { fetched: false, error: "URL did not return HTML content" };
    }

    const html = await res.text();
    const title = extractTag(html, "title");
    const metaDescription =
      extractMeta(html, "description") ?? extractMeta(html, "og:description");
    const textExcerpt = stripToText(html).slice(0, MAX_TEXT_LENGTH);

    return { fetched: true, title, metaDescription, textExcerpt };
  } catch (err) {
    const message =
      err instanceof Error && err.name === "AbortError"
        ? "Website request timed out"
        : "Website could not be reached";
    return { fetched: false, error: message };
  } finally {
    clearTimeout(timeout);
  }
}

export function extractHandle(url: string): string | undefined {
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
