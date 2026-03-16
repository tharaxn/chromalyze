"use client";

import { useActionState, useState } from "react";

import { extractColorsAction } from "@/app/actions";
import { ColorPalette } from "@/components/color-palette";
import { emptyExtractState } from "@/lib/chromalyze";

const exampleUrls = [
  "https://stripe.com",
  "https://notion.so",
  "https://www.framer.com",
];

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
  const [state, formAction, isPending] = useActionState(
    extractColorsAction,
    emptyExtractState,
  );

  const hasPalette = state.colors.length > 0;

  return (
    <main className="relative overflow-hidden px-2 py-2 sm:px-3 lg:px-4">
      <div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col">
        <div className="grid gap-4 xl:min-h-[calc(100vh-1rem)] xl:grid-cols-[0.95fr_1.12fr]">
          <section className="glass-panel rounded-[2rem] px-4 py-4 sm:px-5 sm:py-5 xl:min-h-0">
            <div className="grid gap-4 xl:h-full xl:grid-cols-[1.02fr_0.98fr] xl:items-stretch">
              <div className="flex h-full flex-col xl:pt-5">
                <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[color:var(--line)] bg-white/80 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  <span className="soft-ring h-2.5 w-2.5 rounded-full bg-[color:var(--accent)]" />
                  Website Color Palette Extractor
                </div>

                <h1 className="display-font text-balance max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
                  Chromalyze
                </h1>

                <p className="text-balance mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Extract website color palettes from a single URL, then copy
                  clean HEX values for your design workflow.
                </p>

                <div className="mt-8">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/12">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    </span>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                        How It Works
                      </p>
                      <p className="text-sm text-slate-500">
                        A quick guide to using Chromalyze
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ["01", "Paste URL", "Enter the website you want to sample"],
                      ["02", "Extract", "Let Chromalyze pull the dominant colors"],
                      ["03", "Copy HEX", "Use the swatches as ready-to-use color codes"],
                    ].map(([step, label, description], index) => (
                      <div
                        key={step}
                        className="relative rounded-[1.05rem] border border-slate-200/80 bg-white/82 px-4 py-3"
                      >
                        {index < 2 ? (
                          <div className="pointer-events-none absolute -right-2 top-5 hidden h-px w-4 bg-slate-200 sm:block" />
                        ) : null}
                        <p className="display-font text-sm font-semibold tracking-[0.12em] text-blue-700">
                          {step}
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          {label}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <form
                action={formAction}
                className="glass-panel animate-rise rounded-[1.55rem] p-4 sm:p-5 xl:flex xl:h-full xl:flex-col"
              >
                <div className="mb-4">
                  <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                    Start Here
                  </p>
                  <label
                    htmlFor="websiteUrl"
                    className="display-font block text-xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-2xl"
                  >
                    Website URL
                  </label>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Paste any public website URL and Chromalyze will generate a
                    palette you can copy immediately.
                  </p>
                </div>

                <div className="space-y-3 xl:flex-1">
                  <input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    value={websiteUrl}
                    onChange={(event) => setWebsiteUrl(event.target.value)}
                    placeholder="https://stripe.com"
                    className="w-full rounded-[1.05rem] border border-[color:var(--line-strong)] bg-white px-4 py-3.5 text-base text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <div className="flex flex-wrap gap-2">
                    {exampleUrls.map((exampleUrl) => (
                      <button
                        key={exampleUrl}
                        type="button"
                        onClick={() => setWebsiteUrl(exampleUrl)}
                        className="rounded-full border border-[color:var(--line)] bg-white px-3 py-2 text-xs text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {exampleUrl.replace(/^https?:\/\//, "")}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="group inline-flex w-full items-center justify-center gap-3 rounded-[1.05rem] bg-slate-950 px-5 py-3.5 text-sm font-semibold tracking-[0.14em] text-white uppercase transition duration-300 hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
                  >
                    {isPending ? "Extracting Colors..." : "Extract Colors"}
                  </button>
                </div>

                <div className="mt-3 rounded-[1.05rem] border border-[color:var(--line)] bg-slate-50 px-4 py-3">
                  <p className="text-sm font-medium text-slate-700">
                    Chromalyze now returns only real extracted colors, usually
                    between 1 and 4 depending on the website.
                  </p>
                </div>

                {state.error ? (
                  <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {state.error}
                  </p>
                ) : null}
              </form>
            </div>
          </section>

          <section className="glass-panel rounded-[2rem] px-4 py-4 sm:px-5 sm:py-5 xl:flex xl:min-h-0 xl:flex-col">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Color Palette
                </p>
                <h2 className="display-font text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl">
                  Click any swatch to copy HEX
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {state.normalizedUrl ? (
                  <div className="rounded-full border border-[color:var(--line)] bg-white/85 px-4 py-2 text-sm text-slate-600">
                    {state.normalizedUrl}
                  </div>
                ) : null}
                {hasPalette ? (
                  <div className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white">
                    {state.colors.length} colors
                  </div>
                ) : null}
              </div>
            </div>

            {state.notice ? (
              <p className="mb-4 rounded-2xl border border-blue-100 bg-blue-50/90 px-4 py-3 text-sm text-blue-700">
                {state.notice}
              </p>
            ) : null}

            <div className="xl:flex xl:min-h-0 xl:flex-1 xl:flex-col xl:justify-center">
              {isPending ? <PaletteSkeleton /> : null}

              {!isPending && hasPalette ? (
                <ColorPalette colors={state.colors} />
              ) : null}

              {!isPending && !hasPalette ? (
                <div className="flex min-h-[320px] w-full items-center justify-center rounded-[1.5rem] border border-dashed border-[color:var(--line-strong)] bg-white/65 px-5 py-8 text-center sm:px-6 xl:flex-1 xl:px-8">
                  <div>
                  <p className="display-font mb-3 text-2xl font-semibold text-slate-950">
                    Your palette will appear here
                  </p>
                  <p className="mx-auto max-w-xl text-sm leading-7 text-slate-500">
                    Enter a website URL above, press Extract Colors, and
                    Chromalyze will reveal a clean set of copy-ready HEX
                    swatches.
                  </p>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
