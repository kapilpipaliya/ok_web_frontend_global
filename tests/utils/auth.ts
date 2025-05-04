import { Page, expect } from '@playwright/test';

/**
 * Login to the application
 * @param page Playwright page
 * @param email User email
 * @param password User password
 * @param redirectUrl URL to redirect after login (optional)
 */
export async function login(
  page: Page, 
  email: string = 'superuser', 
  password: string = 'kK11235813@',
  redirectUrl?: string
) {
  const loginUrl = redirectUrl 
    ? `http://localhost:3001/auth/login?redirectUrl=${encodeURIComponent(redirectUrl)}`
    : 'http://localhost:3001/auth/login';
    
  await page.goto(loginUrl);
  
  // Input email with pressSequentially
  await page.locator('input[name="email"]').click();
  await page.locator('input[name="email"]').fill('');
  await page.locator('input[name="email"]').pressSequentially(email, { delay: 100 });
  
  // Input password with pressSequentially
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill('');
  await page.locator('input[name="password"]').pressSequentially(password, { delay: 100 });
  
  // Force blur before clicking to ensure all change events are triggered
  await page.locator('input[name="password"]').blur();
  
  await page.getByRole('button', { name: 'Log In' }).click();
  
  // Verify redirect URL if provided
  if (redirectUrl) {
    await expect(page).toHaveURL(new RegExp('.*' + redirectUrl));
  } else {
    // Wait for login to complete (adjust based on your app's behavior)
    await expect(page).not.toHaveURL(/.*\/auth\/login.*/);
  }
} 