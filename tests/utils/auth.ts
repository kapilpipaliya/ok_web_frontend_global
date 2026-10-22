import { Page, expect } from "@playwright/test";
import { API } from "~/lib/api/endpoints";

export type AuthOptions = {
  /** Full origin, e.g. https://admin.decodeui.io or https://admin.localhost.com:3001 */
  origin?: string;
  subdomain?: string;
  redirectUrl?: string;
};

function resolveOrigin(options?: AuthOptions): string {
  if (options?.origin) {
    return options.origin.replace(/\/$/, "");
  }
  if (process.env.PLAYWRIGHT_ORIGIN) {
    return process.env.PLAYWRIGHT_ORIGIN.replace(/\/$/, "");
  }
  const subdomain = options?.subdomain ?? "admin";
  return `https://${subdomain}.localhost.com:3001`;
}

export function getAuthCredentials() {
  return {
    username: process.env.PLAYWRIGHT_ADMIN_USER ?? "admin",
    password: process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? "kK11235813@",
  };
}

/**
 * Sign in to the application.
 */
export async function signIn(
  page: Page,
  email: string = getAuthCredentials().username,
  password: string = getAuthCredentials().password,
  redirectUrlOrOptions?: string | AuthOptions,
  subdomain: string = "admin",
) {
  const options: AuthOptions =
    typeof redirectUrlOrOptions === "string"
      ? { redirectUrl: redirectUrlOrOptions, subdomain }
      : { subdomain, ...redirectUrlOrOptions };

  const origin = resolveOrigin(options);
  const redirectUrl = options.redirectUrl;
  const loginUrl = redirectUrl
    ? `${origin}${API.urls.admin.signIn}?redirectUrl=${encodeURIComponent(redirectUrl)}`
    : `${origin}${API.urls.admin.signIn}`;

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
    await expect(page).not.toHaveURL(/.*\/auth\/signin.*/i);
  }
}

/**
 * Log out via /auth/logout and assert return to sign-in.
 */
export async function signOut(page: Page, options?: AuthOptions) {
  const origin = resolveOrigin(options);
  await page.goto(`${origin}${API.urls.user.logout}`);
  await expect(page).toHaveURL(/\/auth\/signin/i, { timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Log In" })).toBeVisible({
    timeout: 15_000,
  });
}
