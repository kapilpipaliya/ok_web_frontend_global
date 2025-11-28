import { Page, expect } from "@playwright/test";
import { API } from "~/lib/api/endpoints";

/**
 * Login to the application
 * @param page Playwright page
 * @param email User email
 * @param password User password
 * @param redirectUrl URL to redirect after signIn (optional)
 */
export async function signIn(
  page: Page,
  email: string = "admin",
  password: string = "kK11235813@",
  redirectUrl?: string,
) {
  const loginUrl = redirectUrl
    ? `https://admin.localhost.com:3001/${API.urls.admin.signIn}?redirectUrl=${encodeURIComponent(redirectUrl)}`
    : `https://admin.localhost.com:3001/${API.urls.admin.signIn}`;

  await page.goto(loginUrl);

  // wait for the hydration to complete
  await page.waitForTimeout(1000);

  // Input email with pressSequentially
  await page.locator('input[name="email"]').click();
  await page.locator('input[name="email"]').fill("");
  await page
    .locator('input[name="email"]')
    .pressSequentially(email, { delay: 30 });

  // Input password with pressSequentially
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill("");
  await page
    .locator('input[name="password"]')
    .pressSequentially(password, { delay: 30 });

  // Force blur before clicking to ensure all change events are triggered
  await page.locator('input[name="password"]').blur();

  await page.getByRole("button", { name: "Log In" }).click();

  // Verify redirect URL if provided
  if (redirectUrl) {
    await expect(page).toHaveURL(new RegExp(".*" + redirectUrl));
  } else {
    // Wait for signIn to complete (adjust based on your app's behavior)
    await expect(page).not.toHaveURL(/.*\/auth\/signIn.*/);
  }
}
