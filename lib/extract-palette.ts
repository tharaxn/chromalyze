import { extractHexColorsFromPalette } from "@/lib/chromalyze";

export async function extractPaletteFromImage(imageSource: string | Buffer) {
  const { Vibrant } = await import("node-vibrant/node");
  const palette = await Vibrant.from(imageSource)
    .maxColorCount(4)
    .quality(2)
    .getPalette();

  return extractHexColorsFromPalette(palette);
}
