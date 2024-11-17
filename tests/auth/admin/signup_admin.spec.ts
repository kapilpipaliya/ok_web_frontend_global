import { expect, test } from '@playwright/test';

import { signUpData, superUserData } from '../data/signUpData';
import { fillSignUpForm } from '../functions/fillSignUpForm';
import { logIn } from '../functions/logIn';
import { signOut } from '../functions/signOut';
import { generate401RedirectUrl } from "~/lib/api/endpoints";



test.describe('admin user setup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test.afterEach(async ({ page }) => {

  });

  test('admin signup and login flow', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign Up' }).click();

    await fillSignUpForm(page, signUpData);

    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.waitForURL('/admin/settings');
    
    await expect(page.getByRole('button', { name: 'Edit Settings' })).toBeVisible();

    await signOut(page);

    await logIn(page, signUpData.subDomain, signUpData.password);

    await signOut(page);

    await expect(page.locator('div').filter({ hasText: /^Log In$/ })).toBeVisible();
  });
});

test('redirect to login when visiting /admin/Page/new and then redirect back after login', async ({ page }) => {
  const pathName = '/admin/Page/new';

  await page.goto(pathName);

  await expect(page).toHaveURL(generate401RedirectUrl(pathName));

  await logIn(page, superUserData.email, superUserData.password, { isSuperUser: true });

  await expect(page).toHaveURL(pathName);
});
