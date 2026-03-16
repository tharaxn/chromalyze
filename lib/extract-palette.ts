import { extractHexColorsFromPalette } from "@/lib/chromalyze";

export async function extractPaletteFromImage(imageSource: string | Buffer) {
  const { Vibrant } = await import("node-vibrant/node");
  const palette = await Vibrant.from(imageSource)
    .maxColorCount(8)
    .quality(3)
    .getPalette();

  return extractHexColorsFromPalette(palette);
}
