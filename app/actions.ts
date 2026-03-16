"use server";

import {
  buildScreenshotUrl,
  buildSeededPalette,
  emptyExtractState,
  type ExtractState,
  normalizeWebsiteUrl,
} from "@/lib/chromalyze";
import { extractPaletteFromImage } from "@/lib/extract-palette";

export async function extractColorsAction(
  _previousState: ExtractState,
  formData: FormData,
): Promise<ExtractState> {
  const rawUrl = formData.get("websiteUrl");

  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    return {
      ...emptyExtractState,
      error: "Enter a website URL to extract a palette.",
      submittedAt: Date.now(),
    };
  }

  let normalizedUrl: string;

  try {
    normalizedUrl = normalizeWebsiteUrl(rawUrl);
  } catch {
    return {
      ...emptyExtractState,
      error: "Please provide a valid website URL.",
      submittedAt: Date.now(),
    };
  }

  try {
    const snapshotResponse = await fetch(buildScreenshotUrl(normalizedUrl), {
      cache: "no-store",
      headers: {
        Accept: "image/*",
      },
    });

    if (!snapshotResponse.ok) {
      throw new Error(`Snapshot request failed with ${snapshotResponse.status}`);
    }

    const imageBuffer = Buffer.from(await snapshotResponse.arrayBuffer());
    const colors = await extractPaletteFromImage(imageBuffer);

    if (!colors.length) {
      throw new Error("No colors were extracted from the snapshot.");
    }

    return {
      colors,
      normalizedUrl,
      source: "vibrant",
      error: null,
      notice: "Live palette extracted from a website snapshot.",
      submittedAt: Date.now(),
    };
  } catch {
    return {
      colors: buildSeededPalette(normalizedUrl),
      normalizedUrl,
      source: "fallback",
      error: null,
      notice:
        "Live extraction is temporarily unavailable, so a seeded fallback palette is shown instead.",
      submittedAt: Date.now(),
    };
  }
}
