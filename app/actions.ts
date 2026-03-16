"use server";

import {
  buildScreenshotUrl,
  emptyExtractState,
  type ExtractState,
  normalizeWebsiteUrl,
} from "@/lib/chromalyze";
import { extractPaletteFromImage } from "@/lib/extract-palette";
import {
  discoverWebsiteBrandAssets,
  fetchImageBuffer,
} from "@/lib/website-image-sources";

async function extractFromImageUrl(imageUrl: string) {
  const imageBuffer = await fetchImageBuffer(imageUrl);
  return extractPaletteFromImage(imageBuffer);
}

function hasExpressiveThemeColors(colors: string[]) {
  return colors.some((color) => {
    const { saturation } = getHslFromHex(color);
    return saturation >= 0.12;
  });
}

function getHslFromHex(hex: string) {
  const sanitizedHex = hex.replace("#", "");
  const red = Number.parseInt(sanitizedHex.slice(0, 2), 16) / 255;
  const green = Number.parseInt(sanitizedHex.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(sanitizedHex.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { saturation: 0, lightness };
  }

  return {
    saturation: delta / (1 - Math.abs(2 * lightness - 1)),
    lightness,
  };
}

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

  const failureReasons: string[] = [];

  try {
    const colors = await extractFromImageUrl(buildScreenshotUrl(normalizedUrl));

    if (!colors.length) {
      throw new Error("No colors were extracted from the snapshot.");
    }

    return {
      colors,
      normalizedUrl,
      source: "vibrant",
      error: null,
      notice:
        "Focused palette extracted from the website snapshot. Chromalyze now returns between 1 and 4 colors, depending on what is actually present.",
      submittedAt: Date.now(),
    };
  } catch (error) {
    failureReasons.push(
      error instanceof Error ? `Snapshot failed: ${error.message}` : "Snapshot failed.",
    );
  }

  try {
    const brandAssets = await discoverWebsiteBrandAssets(normalizedUrl);

    if (brandAssets.themeColors.length > 0 && hasExpressiveThemeColors(brandAssets.themeColors)) {
      return {
        colors: brandAssets.themeColors.slice(0, 4),
        normalizedUrl,
        source: "vibrant",
        error: null,
        notice:
          "Palette extracted from website theme-color metadata. This usually reflects the brand more reliably than social share images.",
        submittedAt: Date.now(),
      };
    }

    for (const candidate of brandAssets.logoCandidates) {
      try {
        const colors = await extractFromImageUrl(candidate.url);

        if (!colors.length) {
          continue;
        }

        return {
          colors,
          normalizedUrl,
          source: "vibrant",
          error: null,
          notice:
            "Palette extracted from the website logo because no strong theme color was available.",
          submittedAt: Date.now(),
        };
      } catch (error) {
        failureReasons.push(
          error instanceof Error
            ? `logo failed: ${error.message}`
            : "logo failed.",
        );
      }
    }

    if (brandAssets.themeColors.length > 0) {
      return {
        colors: brandAssets.themeColors.slice(0, 4),
        normalizedUrl,
        source: "vibrant",
        error: null,
        notice:
          "Palette extracted from website theme-color metadata. No stronger brand color source was found, so a simpler palette was used.",
        submittedAt: Date.now(),
      };
    }

    for (const candidate of brandAssets.imageCandidates) {
      try {
        const colors = await extractFromImageUrl(candidate.url);

        if (!colors.length) {
          continue;
        }

        return {
          colors,
          normalizedUrl,
          source: "vibrant",
          error: null,
          notice: `Palette extracted from ${candidate.label}. Chromalyze now returns between 1 and 4 colors, depending on what is actually present.`,
          submittedAt: Date.now(),
        };
      } catch (error) {
        failureReasons.push(
          error instanceof Error
            ? `${candidate.label} failed: ${error.message}`
            : `${candidate.label} failed.`,
        );
      }
    }
  } catch (error) {
    failureReasons.push(
      error instanceof Error
        ? `Website parsing failed: ${error.message}`
        : "Website parsing failed.",
    );
  }

  const reasonSummary =
    failureReasons.length > 0
      ? failureReasons[0]
      : "No usable image source was found.";

  return {
    ...emptyExtractState,
    normalizedUrl,
    source: null,
    error: `Chromalyze could not extract a reliable palette. ${reasonSummary}`,
    notice:
      "Some websites block screenshot and image scraping. When that happens, Chromalyze now stops instead of inventing colors.",
    submittedAt: Date.now(),
  };
}
