import { expect, test } from "@playwright/test";
import { signIn } from "../utils/auth";

/**
 * AskZoom Playwright UI + optional live worker smoke.
 *
 * Env:
 * - ASKZOOM_SUBDOMAIN (default: askzoom)
 * - ASKZOOM_USER / ASKZOOM_PASSWORD (defaults match admin test user)
 * - ZOOM_E2E_FULL=1 enables live enqueue login/checkSession/cancel path
 * - ZOOM_E2E_MEETING_URL required for manage/leave when ZOOM_E2E_FULL=1
 */
const subdomain = process.env.ASKZOOM_SUBDOMAIN || "askzoom";
const email = process.env.ASKZOOM_USER || "admin";
const password = process.env.ASKZOOM_PASSWORD || "kK11235813@";
const full = process.env.ZOOM_E2E_FULL === "1";
const meetingUrl = process.env.ZOOM_E2E_MEETING_URL || "";

const origin = `https://${subdomain}.localhost.com:3001`;

async function gotoZoom(page: import("@playwright/test").Page, path: string) {
  await page.goto(`${origin}${path}`);
  await page.waitForTimeout(800);
}

test.describe("AskZoom Zoom Playwright smoke", () => {
  test("credentials / login / manage pages load", async ({ page }) => {
    await signIn(page, email, password, "/zoom/credentials", subdomain);
    await expect(page).toHaveURL(/\/zoom\/credentials/i);

    await gotoZoom(page, "/zoom/login");
    await expect(page.getByText(/Zoom Login|Login|Record|status/i).first()).toBeVisible({
      timeout: 15000,
    });

    await gotoZoom(page, "/zoom/manage");
    await expect(page.getByText(/Manage|Meeting|status|waiting/i).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("full worker flow: login → checkSession → manage cancel → leave → delete", async ({
    page,
  }) => {
    test.skip(!full, "Set ZOOM_E2E_FULL=1 (and Zoom credentials) to run live worker smoke");
    test.skip(!meetingUrl, "Set ZOOM_E2E_MEETING_URL for manage/leave smoke");

    await signIn(page, email, password, "/zoom/login", subdomain);

    const clickNamed = async (label: RegExp) => {
      const btn = page.getByRole("button", { name: label }).first();
      await expect(btn).toBeVisible({ timeout: 10000 });
      await btn.click();
    };

    await clickNamed(/login|sign in to zoom/i);
    await expect(page.getByText(/logged_in|session|phase/i).first()).toBeVisible({
      timeout: 180000,
    });

    await clickNamed(/check session/i);
    await page.waitForTimeout(3000);

    await gotoZoom(page, "/zoom/manage");
    const meetingInput = page.locator('input[name="meetingUrl"], textarea[name="meetingUrl"]').first();
    if (await meetingInput.count()) {
      await meetingInput.fill(meetingUrl);
    }
    await clickNamed(/start manage|manage meeting|join/i);
    await page.waitForTimeout(5000);
    await clickNamed(/cancel/i);
    await page.waitForTimeout(3000);

    await clickNamed(/leave/i).catch(async () => {
      // leave may already have completed via cancel
    });

    await gotoZoom(page, "/zoom/login");
    const deleteBtn = page.getByRole("button", { name: /delete selected recording/i });
    if (await deleteBtn.isVisible().catch(() => false)) {
      await deleteBtn.click();
      await page.waitForTimeout(1500);
    }
  });
});
