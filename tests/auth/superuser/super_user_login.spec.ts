import { expect, test } from '@playwright/test';

import { superUserData } from '../data/signUpData';
import { logIn } from '../functions/logIn';


test.describe('super user login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('super user signup and login flow', async ({ page }) => {
    await logIn(page, superUserData.email, superUserData.password, { isSuperUser: true });
    await page.waitForURL('/admin/');
    await expect(page.getByRole('heading', { name: 'Recent Users' })).toBeVisible();
    await page.goto('/admin/Page/new');
    // await expect(page.getByRole('heading', { name: 'New Page' })).toBeVisible();
  });
});
