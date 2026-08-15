export const MAX_SCREENSHOTS = 10;
export const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_SCREENSHOT_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export type AcceptedScreenshotType = (typeof ACCEPTED_SCREENSHOT_TYPES)[number];

export function isAcceptedScreenshotType(type: string): type is AcceptedScreenshotType {
  return (ACCEPTED_SCREENSHOT_TYPES as readonly string[]).includes(type);
}
