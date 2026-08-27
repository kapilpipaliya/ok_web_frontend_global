import { chromium, type Locator, type Page } from "playwright";

export type ScrapedAmazonProduct = {
  amazonUrl: string;
  title: string;
  price: string;
  shortDescription: string;
  imageUrls: string[];
};

const DEFAULT_TIMEOUT_MS = 60_000;
const MAX_IMAGES = 20;

export const AMAZON_SCRAPE_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export const AMAZON_SCRAPE_VIEWPORT = { width: 1440, height: 900 } as const;

export const AMAZON_SCRAPE_LOCALE = "en-US";

const TITLE_SELECTORS = [
  "#productTitle",
  "#title span",
  "#title",
  "h1.a-size-large",
  "h1",
];

const OVERLAY_SELECTORS = [
  "#sp-cc-accept",
  "input[name='accept']",
  "#nav-main input[type='submit']",
];

function isAmazonShortLinkHost(host: string): boolean {
  return host === "link.amazon" || host.endsWith(".link.amazon");
}

function isAmazonUrl(raw: string): boolean {
  try {
    const host = new URL(raw).hostname.toLowerCase().replace(/^www\./, "");
    return isAmazonShortLinkHost(host) || host.includes("amazon.");
  } catch {
    return false;
  }
}

function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/** Amazon briefly swaps #ivLargeImage to a spinner before the product photo. */
function isLoadingPlaceholderUrl(url: string): boolean {
  const lower = url.toLowerCase();
  if (lower.startsWith("data:")) return true;
  // Spinner/chrome only — do not reject real product .gif photos
  if (/loading|spinner|placeholder|grey-pixel|transparent-pixel|blank\./i.test(lower)) {
    return true;
  }
  // Real product photos live under /images/I/… (not G/sprites/UI chrome)
  if (!/\/images\/I\//i.test(url)) return true;
  return false;
}

function isUsableProductImageUrl(url: string): boolean {
  const trimmed = String(url || "").trim();
  return !!trimmed && isHttpUrl(trimmed) && !isLoadingPlaceholderUrl(trimmed);
}

function uniqueHttpUrls(urls: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of urls) {
    const url = String(raw || "").trim();
    if (!isUsableProductImageUrl(url)) continue;
    const key = url.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(url);
  }
  return out;
}

function collapseWs(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

async function innerTextOrEmpty(
  loc: Locator,
  timeoutMs = 2000,
): Promise<string> {
  if ((await loc.count()) === 0) return "";
  const text = await loc.innerText({ timeout: timeoutMs }).catch(() => "");
  return collapseWs(text);
}

async function firstText(page: Page, selectors: string[]): Promise<string> {
  for (const selector of selectors) {
    const text = await innerTextOrEmpty(page.locator(selector).first());
    if (text) return text;
  }
  return "";
}

async function dismissOverlays(page: Page): Promise<void> {
  for (const sel of OVERLAY_SELECTORS) {
    const btn = page.locator(sel).first();
    if ((await btn.count()) === 0) continue;
    await btn.click({ timeout: 1000 }).catch(() => undefined);
  }
}

async function scrapePrice(page: Page): Promise<string> {
  const root = page.locator("#corePriceDisplay_desktop_feature_div");
  if ((await root.count()) === 0) return "";

  const offscreen = await innerTextOrEmpty(
    root.locator(".a-price .a-offscreen").first(),
    3000,
  );
  if (offscreen) return offscreen;

  const whole = await innerTextOrEmpty(root.locator(".a-price-whole").first());
  if (!whole) return "";
  const fraction = await innerTextOrEmpty(
    root.locator(".a-price-fraction").first(),
    1000,
  );
  const symbol = await innerTextOrEmpty(
    root.locator(".a-price-symbol").first(),
    1000,
  );
  return `${symbol}${whole.replace(/\.$/, "")}${fraction ? `.${fraction}` : ""}`.trim();
}

async function scrapeDescriptionMarkdown(page: Page): Promise<string> {
  const bullets = await page
    .locator("#feature-bullets ul li span.a-list-item")
    .allInnerTexts()
    .catch(() => [] as string[]);
  const cleaned = bullets
    .map((t) => collapseWs(t))
    .filter((t) => t && !/^about this item$/i.test(t));
  if (cleaned.length > 0) {
    return cleaned
      .slice(0, 8)
      .map((line) => `- ${line}`)
      .join("\n");
  }

  const prose = await firstText(page, [
    "#productDescription p",
    "#productDescription",
    "#bookDescription_feature_div noscript",
  ]);
  if (!prose) return "";
  return prose
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n\n");
}

async function readIvLargeImageSrc(page: Page): Promise<string> {
  const img = page.locator("#ivLargeImage img").first();
  if ((await img.count()) === 0) return "";
  const src =
    (await img.getAttribute("src").catch(() => null)) ||
    (await img.getAttribute("data-old-hires").catch(() => null)) ||
    "";
  if (!isUsableProductImageUrl(src)) return "";
  // Loading gifs are tiny; wait until a real photo is painted when possible.
  const size = await img
    .evaluate((el) => {
      const image = el as HTMLImageElement;
      return { w: image.naturalWidth || 0, h: image.naturalHeight || 0 };
    })
    .catch(() => ({ w: 0, h: 0 }));
  if (size.w > 0 && size.w < 80) return "";
  return src;
}

function bestUrlFromDynamicImageMap(dynJson: string): string {
  if (!dynJson) return "";
  try {
    const map = JSON.parse(dynJson) as Record<string, [number, number]>;
    let bestUrl = "";
    let bestArea = 0;
    for (const [url, dims] of Object.entries(map)) {
      if (!isUsableProductImageUrl(url)) continue;
      const area =
        Array.isArray(dims) && dims.length >= 2
          ? Number(dims[0]) * Number(dims[1])
          : 0;
      if (area >= bestArea) {
        bestArea = area;
        bestUrl = url;
      }
    }
    return bestUrl;
  } catch {
    return "";
  }
}

/**
 * Books / single-image ASINs often have no carousel: #ivThumbs stays hidden.
 * Prefer data-old-hires, then largest data-a-dynamic-image entry, then src.
 */
async function collectLandingImageUrls(page: Page): Promise<string[]> {
  const img = page
    .locator(
      "#landingImage, #imgTagWrapperId img, img[data-a-image-name='landingImage']",
    )
    .first();
  if ((await img.count()) === 0) return [];

  const urls: string[] = [];
  for (const attr of ["data-old-hires", "data-a-hires", "src"] as const) {
    const val = (await img.getAttribute(attr).catch(() => null)) || "";
    if (isUsableProductImageUrl(val)) urls.push(val);
  }

  const dynJson =
    (await img.getAttribute("data-a-dynamic-image").catch(() => null)) || "";
  const best = bestUrlFromDynamicImageMap(dynJson);
  if (best) urls.push(best);

  return uniqueHttpUrls(urls).slice(0, 1);
}

/**
 * Left-rail galleries (#altImages) embed hi-res URLs in ImageBlockATF scripts:
 *   'colorImages': { 'initial': A.$.parseJSON('[{"hiRes":"...","variant":"MAIN"}, ...]') }
 * Thumb srcs use different image IDs, so size-token rewriting cannot recover hi-res.
 */
async function collectImageUrlsFromColorImages(page: Page): Promise<string[]> {
  const urls = await page.evaluate(() => {
    const out: string[] = [];
    const pushUrl = (url: unknown) => {
      if (typeof url !== "string") return;
      const trimmed = url.trim();
      if (!/^https?:\/\//i.test(trimmed)) return;
      if (!/\/images\/I\//i.test(trimmed)) return;
      out.push(trimmed);
    };

    const extractParseJsonString = (
      text: string,
      fromIdx: number,
    ): string | null => {
      const parseIdx = text.indexOf("parseJSON(", fromIdx);
      if (parseIdx < 0 || parseIdx - fromIdx > 120) return null;
      const quoteStart = parseIdx + "parseJSON(".length;
      const quote = text[quoteStart];
      if (quote !== "'" && quote !== '"') return null;
      let i = quoteStart + 1;
      let raw = "";
      while (i < text.length) {
        const ch = text[i];
        if (ch === "\\" && i + 1 < text.length) {
          raw += text[i + 1];
          i += 2;
          continue;
        }
        if (ch === quote) break;
        raw += ch;
        i++;
      }
      return raw;
    };

    for (const script of Array.from(document.querySelectorAll("script"))) {
      const text = script.textContent || "";
      let searchFrom = 0;
      while (searchFrom < text.length) {
        const colorIdx = text.indexOf("colorImages", searchFrom);
        if (colorIdx < 0) break;
        searchFrom = colorIdx + 11;

        const initialIdx = text.indexOf("initial", colorIdx);
        if (initialIdx < 0 || initialIdx - colorIdx > 80) continue;

        const raw = extractParseJsonString(text, initialIdx);
        if (!raw) continue;

        try {
          const arr = JSON.parse(raw) as Array<{
            hiRes?: string | null;
            large?: string | null;
          }>;
          if (!Array.isArray(arr) || arr.length === 0) continue;
          for (const item of arr) {
            pushUrl(item?.hiRes);
            if (!item?.hiRes) pushUrl(item?.large);
          }
          if (out.length > 0) return out;
        } catch {
          /* try next colorImages block */
        }
      }
    }
    return out;
  });

  return uniqueHttpUrls(urls).slice(0, MAX_IMAGES);
}

/**
 * Left-rail fallback: hover/click #altImages image thumbs and read #landingImage.
 * Skips video / 360 thumbs.
 */
async function collectImageUrlsFromAltImages(page: Page): Promise<string[]> {
  const thumbs = page.locator(
    "#altImages li.imageThumbnail:not(.videoThumbnail):not(.360Thumbnail)",
  );
  const count = await thumbs.count().catch(() => 0);
  if (count === 0) return [];

  const urls: string[] = [];
  let previousKey = "";
  const max = Math.min(count, MAX_IMAGES);

  for (let i = 0; i < max; i++) {
    const thumb = thumbs.nth(i);
    try {
      await thumb.scrollIntoViewIfNeeded().catch(() => undefined);
      await thumb.hover({ timeout: 2000 }).catch(() => undefined);
      await thumb.click({ timeout: 2000 }).catch(() => undefined);
      await page.waitForTimeout(350);

      const landing = page.locator("#landingImage").first();
      if ((await landing.count()) === 0) continue;

      const candidates: string[] = [];
      for (const attr of ["data-old-hires", "data-a-hires", "src"] as const) {
        const val = (await landing.getAttribute(attr).catch(() => null)) || "";
        if (isUsableProductImageUrl(val)) candidates.push(val);
      }
      const dyn =
        (await landing.getAttribute("data-a-dynamic-image").catch(() => null)) ||
        "";
      const best = bestUrlFromDynamicImageMap(dyn);
      if (best) candidates.push(best);

      const picked = uniqueHttpUrls(candidates)[0];
      if (!picked) continue;
      const key = picked.split("?")[0];
      if (i === 0 || key !== previousKey) {
        urls.push(picked);
        previousKey = key;
      }
    } catch {
      /* skip stubborn thumbs */
    }
  }

  return uniqueHttpUrls(urls);
}

/**
 * After a thumb click, Amazon often sets src to a loading.gif first.
 * Wait until src differs from previous AND is a real /images/I/ product photo
 * with a non-tiny naturalWidth.
 */
async function waitForLargeImageReady(
  page: Page,
  previousSrc: string,
): Promise<boolean> {
  return page
    .waitForFunction(
      (prev) => {
        const img = document.querySelector(
          "#ivLargeImage img",
        ) as HTMLImageElement | null;
        if (!img?.src || !/^https?:\/\//i.test(img.src)) return false;
        const src = img.src;
        const lower = src.toLowerCase();
        if (src.startsWith("data:")) return false;
        if (/loading|spinner|placeholder|grey-pixel|transparent-pixel/i.test(lower)) {
          return false;
        }
        if (!/\/images\/I\//i.test(src)) return false;
        if (!img.complete || img.naturalWidth < 80) return false;
        if (prev && src === prev) return false;
        return true;
      },
      previousSrc,
      { timeout: 10_000 },
    )
    .then(() => true)
    .catch(() => false);
}

/**
 * Bottom / lightbox gallery: click #imgTagWrapperId → walk #ivThumbs → #ivLargeImage.
 * Left-rail layouts often leave #ivThumbs present but hidden — return [] so callers
 * can fall back to colorImages / #altImages instead of a single landing image.
 */
async function collectImageUrlsFromLightbox(page: Page): Promise<string[]> {
  const wrapper = page.locator("#imgTagWrapperId").first();
  if ((await wrapper.count()) === 0) return [];

  await wrapper.click({ timeout: 5000 }).catch(() => undefined);

  const thumbsVisible = await page
    .locator("#ivThumbs")
    .waitFor({ state: "visible", timeout: 5_000 })
    .then(() => true)
    .catch(() => false);

  if (!thumbsVisible) return [];

  await page
    .locator("#ivThumbs [id^='ivImage_']")
    .first()
    .waitFor({ state: "visible", timeout: 5_000 })
    .catch(() => undefined);

  const thumbs = page.locator(
    "#ivThumbs .ivThumb[id^='ivImage_']:not(.placeholder)",
  );
  const count = await thumbs.count().catch(() => 0);
  if (count === 0) {
    const only = await readIvLargeImageSrc(page);
    return uniqueHttpUrls(only ? [only] : []);
  }

  const urls: string[] = [];
  let previousSrc = await readIvLargeImageSrc(page);
  const max = Math.min(count, MAX_IMAGES);

  for (let i = 0; i < max; i++) {
    const thumb = thumbs.nth(i);
    try {
      await thumb.scrollIntoViewIfNeeded();
      await thumb.click({ timeout: 2000 });
      const ready = await waitForLargeImageReady(page, previousSrc);
      await page.waitForTimeout(200);
      const src = await readIvLargeImageSrc(page);
      if (!src) continue;

      // First thumb may already be selected (src unchanged) — keep once if usable.
      if (i === 0 && !ready && src === previousSrc) {
        urls.push(src);
        continue;
      }

      if (src !== previousSrc) {
        urls.push(src);
        previousSrc = src;
      }
    } catch {
      /* skip unclickable thumbs */
    }
  }

  return uniqueHttpUrls(urls);
}

/**
 * Prefer embedded colorImages (left-rail), then lightbox thumbs (bottom gallery),
 * then interactive #altImages, then the single landing image.
 */
async function collectProductImageUrls(page: Page): Promise<string[]> {
  const fromColor = await collectImageUrlsFromColorImages(page);
  if (fromColor.length > 0) return fromColor;

  const fromLightbox = await collectImageUrlsFromLightbox(page);
  if (fromLightbox.length > 1) return fromLightbox;

  const fromAlt = await collectImageUrlsFromAltImages(page);
  if (fromAlt.length > 0) return fromAlt;

  if (fromLightbox.length > 0) return fromLightbox;
  return collectLandingImageUrls(page);
}

export async function scrapeAmazonProductFromPage(
  page: Page,
  amazonUrl: string,
  options?: { timeoutMs?: number },
): Promise<ScrapedAmazonProduct> {
  const url = String(amazonUrl || "").trim();
  if (!url || !isAmazonUrl(url)) {
    throw new Error("A valid Amazon product URL is required");
  }

  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  page.setDefaultTimeout(timeoutMs);

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });

  const startHost = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  if (isAmazonShortLinkHost(startHost)) {
    await page
      .waitForURL(
        (next) =>
          /amazon\./i.test(next.hostname) &&
          /\/(dp|gp\/product|gp\/aw\/d)\//i.test(next.pathname),
        { timeout: timeoutMs, waitUntil: "domcontentloaded" },
      )
      .catch(() => undefined);
  }

  await page.waitForSelector("#title", { timeout: timeoutMs });
  await dismissOverlays(page);

  const title = await firstText(page, TITLE_SELECTORS);
  if (!title) {
    throw new Error("Could not read Amazon product title");
  }

  const price = await scrapePrice(page);
  const shortDescription = await scrapeDescriptionMarkdown(page);
  const imageUrls = await collectProductImageUrls(page);
  if (imageUrls.length === 0) {
    throw new Error("Could not find product images on the Amazon page");
  }

  return {
    amazonUrl: url,
    title,
    price,
    shortDescription,
    imageUrls,
  };
}

export async function scrapeAmazonProduct(
  amazonUrl: string,
  options?: { timeoutMs?: number },
): Promise<ScrapedAmazonProduct> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--disable-blink-features=AutomationControlled"],
    });
    const context = await browser.newContext({
      userAgent: AMAZON_SCRAPE_USER_AGENT,
      viewport: AMAZON_SCRAPE_VIEWPORT,
      locale: AMAZON_SCRAPE_LOCALE,
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();
    return await scrapeAmazonProductFromPage(page, amazonUrl, { timeoutMs });
  } finally {
    await browser?.close();
  }
}
