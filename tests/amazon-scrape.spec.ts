import { test, expect } from "@playwright/test";
import {
  AMAZON_SCRAPE_LOCALE,
  AMAZON_SCRAPE_USER_AGENT,
  AMAZON_SCRAPE_VIEWPORT,
  scrapeAmazonProductFromPage,
} from "~/lib/playwright/scrapeAmazonProduct";

// Edit these, then run:
//   npx playwright test tests/amazon-scrape.spec.ts --project=chromium --debug
//   npx playwright test tests/amazon-scrape.spec.ts --project=chromium --ui
const AMAZON_URL =
  "https://www.amazon.in/Prestige-Anodised-Cookware-Induction-Perma-Cool/dp/B00N2ZJCJA";

test.use({
  userAgent: AMAZON_SCRAPE_USER_AGENT,
  viewport: { ...AMAZON_SCRAPE_VIEWPORT },
  locale: AMAZON_SCRAPE_LOCALE,
});

test("amazon page scrape", async ({ page }) => {
  test.setTimeout(120_000);

  // Uncomment to inspect before scrape:
  // await page.pause();

  const scraped = await scrapeAmazonProductFromPage(page, AMAZON_URL);

  console.log("scraped:", scraped);
  expect(scraped.title.length).toBeGreaterThan(3);
  expect(scraped.imageUrls.length).toBeGreaterThan(0);

  // Uncomment to inspect after scrape:
  // await page.pause();
});
