"use client";

import { useEffect, useEffectEvent, useState } from "react";

function getReadableTextColor(hexColor: string) {
  const sanitizedHex = hexColor.replace("#", "");
  const red = Number.parseInt(sanitizedHex.slice(0, 2), 16);
  const green = Number.parseInt(sanitizedHex.slice(2, 4), 16);
  const blue = Number.parseInt(sanitizedHex.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 150 ? "#08111F" : "#F8FAFC";
}

type ColorPaletteProps = {
  colors: string[];
};

export function ColorPalette({ colors }: ColorPaletteProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const clearCopiedHex = useEffectEvent(() => {
    setCopiedHex(null);
  });

  useEffect(() => {
    if (!copiedHex) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      clearCopiedHex();
    }, 1600);

    return () => window.clearTimeout(timeoutId);
  }, [copiedHex]);

  async function handleCopy(hex: string) {
    await navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {colors.map((hex, index) => {
        const isCopied = copiedHex === hex;
        const labelColor = getReadableTextColor(hex);

        return (
          <button
            key={hex}
            type="button"
            onClick={() => void handleCopy(hex)}
            className="animate-swatch group rounded-[1.6rem] border border-[color:var(--line)] bg-white/88 p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_18px_45px_rgba(14,30,64,0.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <div
              className="relative mb-4 h-32 overflow-hidden rounded-[1.25rem] border border-black/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
              style={{ backgroundColor: hex }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/12 to-black/10" />
              <div className="absolute right-3 top-3 rounded-full border border-white/30 bg-white/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] backdrop-blur-sm">
                <span style={{ color: labelColor }}>
                  {isCopied ? "Copied" : "Copy"}
                </span>
              </div>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="display-font text-xl font-semibold tracking-[-0.03em] text-slate-950">
                  {hex}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {isCopied ? "HEX copied to clipboard" : "Tap card to copy"}
                </p>
              </div>

              <span className="rounded-full border border-[color:var(--line)] bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 transition duration-300 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-700">
                Copy
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
