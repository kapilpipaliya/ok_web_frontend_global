import { test, expect } from "@playwright/test";
import {
  getAuthCredentials,
  signIn,
  signOut,
} from "../utils/auth";
import { API } from "~/lib/api/endpoints";

/**
 * UI smoke: auth sign-in / logout against a real admin origin.
 *
 * Default origin: https://admin.decodeui.io
 * Override with PLAYWRIGHT_ORIGIN / PLAYWRIGHT_ADMIN_USER / PLAYWRIGHT_ADMIN_PASSWORD.
 */
const ORIGIN =
  process.env.PLAYWRIGHT_ORIGIN ?? "https://admin.decodeui.io";

test.describe("auth smoke (sign-in / logout)", () => {
  test("signs in, lands in admin, then logs out to sign-in", async ({
    page,
  }) => {
    const { username, password } = getAuthCredentials();

    await signIn(page, username, password, {
      origin: ORIGIN,
      redirectUrl: API.urls.admin.root,
    });

    await expect(page).toHaveURL(new RegExp(`${API.urls.admin.root}`));
    await expect(page).not.toHaveURL(/\/auth\/signin/i);

    await signOut(page, { origin: ORIGIN });

    await expect(page).toHaveURL(/\/auth\/signin/i);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });
});
