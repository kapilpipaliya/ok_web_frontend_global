import { Page } from "@playwright/test";

export async function signOut(page: Page): Promise<void> {
  await page.locator('#dropdown-toggle').click();
  await page.getByText('Sign Out').click();
}
