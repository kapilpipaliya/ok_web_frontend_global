import { expect, test } from '@playwright/test';

import { superUserData } from '../auth/data/signUpData';
import { logIn } from '../auth/functions/logIn';

test.use({baseURL: 'https://mydomain.com'})

test.describe('make sure label exists', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await logIn(page, superUserData.email, superUserData.password, { isSuperUser: true });
    await page.waitForURL('/admin/');
  });

  test('test', async ({ page }) => {
    await page.goto('/admin/DataType/new');
  });
});