"use client";

import { useActionState, useDeferredValue, useState } from "react";

import { extractColorsAction } from "@/app/actions";
import { ColorPalette } from "@/components/color-palette";
import { emptyExtractState } from "@/lib/chromalyze";

function PreviewBrowser({ websiteUrl }: { websiteUrl: string }) {
  const previewUrl = websiteUrl.trim() || "https://www.chromalyze.design";

  return (
    <div className="glass-panel animate-rise relative overflow-hidden rounded-[2rem] p-5">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
      <div className="mb-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-slate-500">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
        Live Website Sampling
      </div>

      <div className="rounded-[1.6rem] border border-[color:var(--line)] bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
          <div className="ml-2 flex-1 truncate rounded-full border border-[color:var(--line)] bg-slate-50 px-3 py-2 text-xs text-slate-500">
            {previewUrl}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.28),_transparent_34%),linear-gradient(160deg,_#04101f_0%,_#0c1b35_48%,_#edf4ff_48.1%,_#ffffff_100%)] p-6 text-white">
            <div className="mb-10 max-w-xs">
              <p className="mb-3 text-[0.65rem] uppercase tracking-[0.28em] text-blue-100/80">
                Chromalyze Capture
              </p>
              <h2 className="display-font text-3xl font-semibold leading-none">
                Extract the palette behind the interface.
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-blue-50/80">
              <span className="rounded-full border border-white/20 px-3 py-2">
                UI sampling
              </span>
              <span className="rounded-full border border-white/20 px-3 py-2">
                One-click copy
              </span>
              <span className="rounded-full border border-white/20 px-3 py-2">
                Tailwind ready
              </span>
            </div>

            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-400/30 blur-3xl" />
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.4rem] border border-[color:var(--line)] bg-slate-950 p-5 text-white">
              <p className="mb-2 text-xs uppercase tracking-[0.26em] text-blue-200/70">
                Ready for Designers
              </p>
              <p className="text-sm leading-6 text-slate-300">
                Paste any URL, sample the vibe, and copy production-ready HEX
                tokens in seconds.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["Fast", "Palette in one click"],
                ["Clean", "Minimal fashion UI"],
                ["Useful", "Clipboard-friendly cards"],
                ["Modern", "Motion and gradients"],
              ].map(([title, copy]) => (
                <div
                  key={title}
                  className="rounded-[1.25rem] border border-[color:var(--line)] bg-white/80 p-4"
                >
                  <p className="display-font mb-1 text-lg font-semibold text-slate-950">
                    {title}
                  </p>
                  <p className="text-sm text-slate-500">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaletteSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[1.5rem] border border-[color:var(--line)] bg-white/70 p-4"
        >
          <div className="mb-4 h-28 rounded-[1.2rem] bg-slate-200" />
          <div className="mb-2 h-4 w-24 rounded-full bg-slate-200" />
          <div className="h-3 w-20 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function ChromalyzeApp() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const deferredUrl = useDeferredValue(websiteUrl);
  const [state, formAction, isPending] = useActionState(
    extractColorsAction,
    emptyExtractState,
  );

  const hasPalette = state.colors.length > 0;

  return (
    <main className="relative overflow-hidden px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8">
        <section className="glass-panel rounded-[2rem] px-5 py-5 sm:px-8 sm:py-7">
          <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[color:var(--line)] bg-white/80 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-500">
                <span className="soft-ring h-2.5 w-2.5 rounded-full bg-[color:var(--accent)]" />
                Website Color Intelligence
              </div>

              <h1 className="display-font text-balance max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-7xl">
                Chromalyze
              </h1>

              <p className="text-balance mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                A designer-friendly tool for extracting elegant color palettes
                from websites, with fast copyable HEX values and a polished
                studio-like interface.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-md">
              {[
                ["01", "Paste a website URL"],
                ["02", "Extract dominant colors"],
                ["03", "Copy HEX tokens instantly"],
              ].map(([step, label]) => (
                <div
                  key={step}
                  className="rounded-[1.35rem] border border-[color:var(--line)] bg-white/85 p-4"
                >
                  <p className="display-font mb-2 text-sm font-semibold tracking-[0.18em] text-blue-700">
                    {step}
                  </p>
                  <p className="text-sm leading-6 text-slate-600">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
            <form
              action={formAction}
              className="glass-panel animate-rise rounded-[2rem] p-5 sm:p-6"
            >
              <div className="mb-6">
                <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-slate-500">
                  Palette Input
                </p>
                <label
                  htmlFor="websiteUrl"
                  className="display-font mb-2 block text-2xl font-semibold tracking-[-0.03em] text-slate-950"
                >
                  Paste a website URL
                </label>
                <p className="max-w-md text-sm leading-6 text-slate-500">
                  Chromalyze can attempt a live website snapshot, then pull a
                  refined color palette from it using `node-vibrant`.
                </p>
              </div>

              <div className="mb-4 space-y-3">
                <input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  value={websiteUrl}
                  onChange={(event) => setWebsiteUrl(event.target.value)}
                  placeholder="https://stripe.com"
                  className="w-full rounded-[1.35rem] border border-[color:var(--line-strong)] bg-white px-4 py-4 text-base text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="submit"
                  disabled={isPending}
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-[1.35rem] bg-slate-950 px-5 py-4 text-sm font-semibold tracking-[0.16em] text-white uppercase transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-400 transition group-hover:bg-white" />
                  {isPending ? "Extracting Colors..." : "Extract Colors"}
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.15rem] border border-[color:var(--line)] bg-white/80 p-4">
                  <p className="mb-1 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                    Output
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    Palette cards animate in and every swatch is clickable to
                    copy its HEX value.
                  </p>
                </div>

                <div className="rounded-[1.15rem] border border-[color:var(--line)] bg-[color:var(--accent-deep)] p-4 text-white">
                  <p className="mb-1 text-[11px] uppercase tracking-[0.22em] text-blue-200/80">
                    Theme
                  </p>
                  <p className="text-sm leading-6 text-slate-300">
                    Built around white, black, and blue with a minimal,
                    fashion-forward presentation.
                  </p>
                </div>
              </div>

              {state.error ? (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {state.error}
                </p>
              ) : null}
            </form>

            <PreviewBrowser websiteUrl={deferredUrl} />
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] px-5 py-6 sm:px-8 sm:py-7">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-slate-500">
                Color Palette
              </p>
              <h2 className="display-font text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Click any swatch to copy its HEX
              </h2>
            </div>

            {state.normalizedUrl ? (
              <div className="rounded-full border border-[color:var(--line)] bg-white/85 px-4 py-2 text-sm text-slate-600">
                Source: {state.normalizedUrl}
              </div>
            ) : null}
          </div>

          {state.notice ? (
            <p className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/90 px-4 py-3 text-sm text-blue-700">
              {state.notice}
            </p>
          ) : null}

          {isPending ? <PaletteSkeleton /> : null}

          {!isPending && hasPalette ? (
            <ColorPalette colors={state.colors} />
          ) : null}

          {!isPending && !hasPalette ? (
            <div className="rounded-[1.75rem] border border-dashed border-[color:var(--line-strong)] bg-white/65 px-6 py-12 text-center">
              <p className="display-font mb-3 text-2xl font-semibold text-slate-950">
                Your palette will appear here
              </p>
              <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-500">
                Enter a website URL above, press Extract Colors, and Chromalyze
                will reveal a clean set of copy-ready HEX swatches.
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
