import type { Palette, Swatch } from "@vibrant/color";

export type ExtractSource = "vibrant" | null;

export type ExtractState = {
  colors: string[];
  normalizedUrl: string;
  source: ExtractSource;
  error: string | null;
  notice: string | null;
  submittedAt: number | null;
};

export const emptyExtractState: ExtractState = {
  colors: [],
  normalizedUrl: "",
  source: null,
  error: null,
  notice: null,
  submittedAt: null,
};

const paletteOrder = [
  "Vibrant",
  "DarkVibrant",
  "LightVibrant",
  "Muted",
  "DarkMuted",
  "LightMuted",
] as const;

const palettePriority: Record<(typeof paletteOrder)[number], number> = {
  Vibrant: 24,
  DarkVibrant: 18,
  LightVibrant: 12,
  Muted: 10,
  DarkMuted: 7,
  LightMuted: 5,
};

type RankedCandidate = {
  hex: string;
  population: number;
  saturation: number;
  lightness: number;
  score: number;
};

export function normalizeWebsiteUrl(value: string) {
  const trimmedValue = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;
  const normalizedUrl = new URL(withProtocol);

  return normalizedUrl.toString();
}

export function buildScreenshotUrl(websiteUrl: string) {
  // Swap this endpoint for your preferred screenshot provider in production.
  return `https://image.thum.io/get/width/1440/crop/960/noanimate/${encodeURIComponent(websiteUrl)}`;
}

export function extractHexColorsFromPalette(palette: Palette) {
  const rankedCandidates = paletteOrder
    .map((key) => {
      const swatch = palette[key];

      if (!swatch) {
        return null;
      }

      return {
        hex: swatch.hex.toUpperCase(),
        population: swatch.population,
        saturation: swatch.hsl[1],
        lightness: swatch.hsl[2],
        score: scoreSwatch(swatch, palettePriority[key]),
      };
    })
    .filter((candidate): candidate is RankedCandidate => Boolean(candidate))
    .sort((left, right) => right.score - left.score);

  if (!rankedCandidates.length) {
    return [];
  }

  if (shouldUseMonochromePalette(rankedCandidates)) {
    return dedupeNearbyColors(
      rankedCandidates
        .filter((candidate) => isUsefulMonochromeColor(candidate))
        .sort((left, right) => right.population - left.population)
        .map((candidate) => candidate.hex),
      42,
    ).slice(0, 4);
  }

  const focusedColors = dedupeNearbyColors(
    rankedCandidates
      .filter((candidate) => isDistinctiveColorCandidate(candidate))
      .map((candidate) => candidate.hex),
    52,
  );

  if (focusedColors.length > 0) {
    return focusedColors.slice(0, 4);
  }

  return dedupeNearbyColors(
    rankedCandidates.map((candidate) => candidate.hex),
    46,
  ).slice(0, 4);
}

export function dedupeHexColors(colors: string[]) {
  return [...new Set(colors.map((color) => color.toUpperCase()))];
}

function shouldUseMonochromePalette(candidates: RankedCandidate[]) {
  const strongestSaturation = Math.max(
    ...candidates.map((candidate) => candidate.saturation),
  );
  const totalPopulation = candidates.reduce((total, candidate) => {
    return total + Math.max(candidate.population, 1);
  }, 0);
  const weightedSaturation =
    candidates.reduce((total, candidate) => {
      return total + candidate.saturation * Math.max(candidate.population, 1);
    }, 0) / totalPopulation;

  return strongestSaturation < 0.18 || weightedSaturation < 0.12;
}

function isUsefulMonochromeColor(candidate: RankedCandidate) {
  if (candidate.population < 1) {
    return false;
  }

  if (candidate.saturation > 0.2) {
    return false;
  }

  return candidate.lightness <= 0.98;
}

function isDistinctiveColorCandidate(candidate: RankedCandidate) {
  if (candidate.population < 1) {
    return false;
  }

  if (candidate.lightness > 0.97 || candidate.lightness < 0.04) {
    return false;
  }

  if (candidate.saturation < 0.08 && candidate.lightness > 0.18) {
    return false;
  }

  return true;
}

function scoreSwatch(swatch: Swatch, priorityBoost: number) {
  const saturation = swatch.hsl[1];
  const lightness = swatch.hsl[2];
  const populationScore = Math.min(swatch.population, 200) * 1.15;
  const saturationScore = saturation * 42;
  const neutralBonus = saturation < 0.16 ? 12 : 0;
  const midtoneBonus = 14 - Math.abs(lightness - 0.52) * 28;
  const hardExtremePenalty =
    lightness < 0.02 || lightness > 0.985 ? 24 : 0;

  return (
    priorityBoost +
    populationScore +
    saturationScore +
    neutralBonus +
    midtoneBonus -
    hardExtremePenalty
  );
}

function dedupeNearbyColors(colors: string[], minDistance: number) {
  const uniqueColors: string[] = [];

  for (const color of dedupeHexColors(colors)) {
    const isTooClose = uniqueColors.some(
      (existingColor) => getColorDistance(existingColor, color) < minDistance,
    );

    if (!isTooClose) {
      uniqueColors.push(color);
    }
  }

  return uniqueColors;
}

function getColorDistance(firstHex: string, secondHex: string) {
  const first = hexToRgb(firstHex);
  const second = hexToRgb(secondHex);

  return Math.sqrt(
    (first.red - second.red) ** 2 +
      (first.green - second.green) ** 2 +
      (first.blue - second.blue) ** 2,
  );
}

function hexToRgb(hex: string) {
  const sanitizedHex = hex.replace("#", "");

  return {
    red: Number.parseInt(sanitizedHex.slice(0, 2), 16),
    green: Number.parseInt(sanitizedHex.slice(2, 4), 16),
    blue: Number.parseInt(sanitizedHex.slice(4, 6), 16),
  };
}
