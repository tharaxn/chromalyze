export type ImageCandidate = {
  label: string;
  url: string;
};

export type WebsiteBrandAssets = {
  themeColors: string[];
  logoCandidates: ImageCandidate[];
  imageCandidates: ImageCandidate[];
};

const browserHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
};

export async function discoverWebsiteBrandAssets(websiteUrl: string) {
  const response = await fetch(websiteUrl, {
    cache: "no-store",
    headers: browserHeaders,
  });

  if (!response.ok) {
    throw new Error(`Website request failed with ${response.status}.`);
  }

  const html = await response.text();

  return {
    themeColors: extractThemeColors(html),
    logoCandidates: dedupeCandidates(extractLogoImageCandidates(html, websiteUrl)),
    imageCandidates: dedupeCandidates([
      ...extractLinkImageCandidates(html, websiteUrl),
      ...extractMetaImageCandidates(html, websiteUrl),
    ]),
  } satisfies WebsiteBrandAssets;
}

export async function fetchImageBuffer(imageUrl: string) {
  const response = await fetch(imageUrl, {
    cache: "no-store",
    headers: {
      Accept: "image/*,*/*;q=0.8",
      "User-Agent": browserHeaders["User-Agent"],
      Referer: imageUrl,
    },
  });

  if (!response.ok) {
    throw new Error(`Image request failed with ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.startsWith("image/")) {
    throw new Error("Response was not an image.");
  }

  return Buffer.from(await response.arrayBuffer());
}

function extractThemeColors(html: string) {
  const matches = html.match(/<meta\b[^>]*>/gi) ?? [];
  const colors: string[] = [];

  for (const tag of matches) {
    const property = getAttribute(tag, "property")?.toLowerCase() ?? "";
    const name = getAttribute(tag, "name")?.toLowerCase() ?? "";
    const content = getAttribute(tag, "content")?.trim() ?? "";

    if (!content) {
      continue;
    }

    if (
      name === "theme-color" ||
      name === "msapplication-tilecolor" ||
      property === "theme-color"
    ) {
      const normalizedColor = normalizeColorValue(content);

      if (normalizedColor) {
        colors.push(normalizedColor);
      }
    }
  }

  return [...new Set(colors)];
}

function extractMetaImageCandidates(html: string, websiteUrl: string) {
  const matches = html.match(/<meta\b[^>]*>/gi) ?? [];
  const candidates: ImageCandidate[] = [];

  for (const tag of matches) {
    const property = getAttribute(tag, "property")?.toLowerCase() ?? "";
    const name = getAttribute(tag, "name")?.toLowerCase() ?? "";
    const content = getAttribute(tag, "content");

    if (!content) {
      continue;
    }

    if (
      property === "og:image" ||
      property === "og:image:url" ||
      name === "twitter:image" ||
      name === "twitter:image:src"
    ) {
      const resolvedUrl = resolveUrl(content, websiteUrl);

      if (resolvedUrl) {
        candidates.push({
          label: property || name,
          url: resolvedUrl,
        });
      }
    }
  }

  return candidates;
}

function extractLogoImageCandidates(html: string, websiteUrl: string) {
  const matches = html.match(/<img\b[^>]*>/gi) ?? [];
  const hostname = new URL(websiteUrl).hostname.replace(/^www\./, "").toLowerCase();
  const brandToken = hostname.split(".")[0] ?? "";
  const candidates: Array<ImageCandidate & { score: number }> = [];

  for (const tag of matches) {
    const src = getAttribute(tag, "src");

    if (!src) {
      continue;
    }

    const resolvedUrl = resolveUrl(src, websiteUrl);

    if (!resolvedUrl) {
      continue;
    }

    const alt = getAttribute(tag, "alt")?.toLowerCase() ?? "";
    const className = getAttribute(tag, "class")?.toLowerCase() ?? "";
    const id = getAttribute(tag, "id")?.toLowerCase() ?? "";
    const ariaLabel = getAttribute(tag, "aria-label")?.toLowerCase() ?? "";
    const descriptor = `${alt} ${className} ${id} ${ariaLabel} ${resolvedUrl.toLowerCase()}`;

    let score = 0;

    if (descriptor.includes("logo")) {
      score += 8;
    }

    if (descriptor.includes("brand")) {
      score += 4;
    }

    if (descriptor.includes("wordmark") || descriptor.includes("logomark")) {
      score += 4;
    }

    if (brandToken && descriptor.includes(brandToken)) {
      score += 3;
    }

    if (resolvedUrl.match(/\.(svg|png|webp|jpg|jpeg)(\?|$)/i)) {
      score += 1;
    }

    if (score > 0) {
      candidates.push({
        label: "logo",
        url: resolvedUrl,
        score,
      });
    }
  }

  return candidates
    .sort((left, right) => right.score - left.score)
    .map(({ label, url }) => ({ label, url }));
}

function extractLinkImageCandidates(html: string, websiteUrl: string) {
  const matches = html.match(/<link\b[^>]*>/gi) ?? [];
  const candidates: ImageCandidate[] = [];

  for (const tag of matches) {
    const rel = getAttribute(tag, "rel")?.toLowerCase() ?? "";
    const href = getAttribute(tag, "href");

    if (!href) {
      continue;
    }

    if (
      rel.includes("apple-touch-icon") ||
      rel === "icon" ||
      rel.includes("shortcut icon")
    ) {
      const resolvedUrl = resolveUrl(href, websiteUrl);

      if (resolvedUrl) {
        candidates.push({
          label: rel,
          url: resolvedUrl,
        });
      }
    }
  }

  return candidates;
}

function getAttribute(tag: string, attributeName: string) {
  const match = tag.match(
    new RegExp(`${attributeName}\\s*=\\s*["']([^"']+)["']`, "i"),
  );

  return match?.[1] ?? null;
}

function normalizeColorValue(value: string) {
  const hexMatch = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);

  if (!hexMatch) {
    return null;
  }

  const sanitizedValue = value.toUpperCase();

  if (sanitizedValue.length === 4) {
    return `#${sanitizedValue[1]}${sanitizedValue[1]}${sanitizedValue[2]}${sanitizedValue[2]}${sanitizedValue[3]}${sanitizedValue[3]}`;
  }

  return sanitizedValue;
}

function resolveUrl(rawUrl: string, websiteUrl: string) {
  if (!rawUrl || rawUrl.startsWith("data:")) {
    return null;
  }

  try {
    return new URL(rawUrl, websiteUrl).toString();
  } catch {
    return null;
  }
}

function dedupeCandidates(candidates: ImageCandidate[]) {
  const seenUrls = new Set<string>();

  return candidates.filter((candidate) => {
    if (seenUrls.has(candidate.url)) {
      return false;
    }

    seenUrls.add(candidate.url);
    return true;
  });
}
