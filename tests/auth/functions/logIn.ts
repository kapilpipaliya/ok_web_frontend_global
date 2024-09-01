import { expect, Page } from "@playwright/test";

export async function logIn(page: Page, username: string, password: string, options?: { isSuperUser?: boolean }): Promise<void> {
  await page.getByPlaceholder('Your email or username').fill(username);
  await page.getByPlaceholder('Your Password').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  const url = new URL(page.url());
  const redirectUrl = url.searchParams.get('redirectUrl');
  if (!options?.isSuperUser && !redirectUrl) {
    await expect(page.getByRole('button', { name: 'Edit Settings' })).toBeVisible();
  }
}
