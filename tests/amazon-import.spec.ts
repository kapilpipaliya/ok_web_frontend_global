import { test, expect } from "@playwright/test";
import { signIn } from "./utils/auth";

// Edit these, then run:
//   npx playwright test tests/amazon-import.spec.ts --project=chromium --debug
//   npx playwright test tests/amazon-import.spec.ts --project=chromium --ui
const AMAZON_URL =
  "https://www.amazon.in/Prestige-Anodised-Cookware-Induction-Perma-Cool/dp/B00N2ZJCJA/ref=sr_1_6?crid=268PNSDW11VI9&dib=eyJ2IjoiMSJ9.vjXj3REW8wYEzYSEDxPUA2xP7MfuXPOGvXSB01iWimN7A5eliBszi4z45SpFrs-8Iqefk_F1HJEiQngVT_ynjYW8DCbbCcyAlbivLgoP3cmGRT92nPEtNKxoVWhK0LPt0TNFcqHWxBPCk0j8RjKnBz0XTdhh5Agl4f8vXI38Nt5NT3OyqRT1_FLgLxgmYrvvrwUFc9_kh4qKolGHMpqCN4-8f3WJ829wN7JvBu342FbNTm2BNXvZF8zOfSMB-2f3Wen_u-m3T-0NJtD86_TzhQdOOi8IwAMptt1g1wN6lWs.s5aujca6HcxBwgn9CLmU8ALRbhnXmNjpfKNeqdO4JbE&dib_tag=se&keywords=Tawa&qid=1786594398&sprefix=tawa%2Caps%2C294&sr=8-6&th=1";
const PRODUCT_TITLE = "TawaTawa Cookware Set";

test("amazon import", async ({ page }) => {
  test.setTimeout(180_000);

  await signIn(page, "admin", "Kapil@1234", "/portal/amazon-import", "lessn");
  await expect(page).toHaveURL(/.*\/portal\/amazon-import/);
  await expect(page.getByRole("heading", { name: "Amazon product import" })).toBeVisible();

  await page.getByPlaceholder("https://www.amazon.com/dp/...").fill(AMAZON_URL);
  await page.getByPlaceholder("Your listing title").fill(PRODUCT_TITLE);
  await expect(page.getByPlaceholder("wireless-earbuds")).toHaveValue("TawaTawa-Cookware-Set");

  // Uncomment to inspect the form before save:
  // await page.pause();

  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText(/Importing 1 of 1/)).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByRole("heading", { name: "Created product" })).toBeVisible({
    timeout: 150_000,
  });
  await expect(page.getByRole("heading", { name: "Uploaded images" })).toBeVisible();
});
