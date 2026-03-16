import type { Palette } from "@vibrant/color";

export type ExtractSource = "vibrant" | "fallback" | null;

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
  const orderedColors = paletteOrder
    .map((key) => palette[key]?.hex ?? null)
    .filter((color): color is string => Boolean(color));
  const allColors = Object.values(palette)
    .map((swatch) => swatch?.hex ?? null)
    .filter((color): color is string => Boolean(color));

  return dedupeHexColors([...orderedColors, ...allColors]).slice(0, 8);
}

export function dedupeHexColors(colors: string[]) {
  return [...new Set(colors.map((color) => color.toUpperCase()))];
}

export function buildSeededPalette(seed: string) {
  const baseHue = hashString(seed) % 360;

  return dedupeHexColors([
    hslToHex(baseHue, 72, 53),
    hslToHex((baseHue + 18) % 360, 60, 30),
    hslToHex((baseHue + 220) % 360, 28, 14),
    hslToHex((baseHue + 196) % 360, 42, 82),
    hslToHex((baseHue + 36) % 360, 58, 68),
    "#F8FAFC",
  ]);
}

function hashString(input: string) {
  return input.split("").reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) >>> 0;
  }, 7);
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const normalizedSaturation = saturation / 100;
  const normalizedLightness = lightness / 100;
  const chroma =
    (1 - Math.abs(2 * normalizedLightness - 1)) * normalizedSaturation;
  const segment = hue / 60;
  const secondComponent = chroma * (1 - Math.abs((segment % 2) - 1));
  const matchValue = normalizedLightness - chroma / 2;

  const [red, green, blue] =
    segment < 1
      ? [chroma, secondComponent, 0]
      : segment < 2
        ? [secondComponent, chroma, 0]
        : segment < 3
          ? [0, chroma, secondComponent]
          : segment < 4
            ? [0, secondComponent, chroma]
            : segment < 5
              ? [secondComponent, 0, chroma]
              : [chroma, 0, secondComponent];

  return `#${[red, green, blue]
    .map((value) =>
      Math.round((value + matchValue) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")
    .toUpperCase()}`;
}
