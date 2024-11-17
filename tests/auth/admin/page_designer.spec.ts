import { expect, test } from '@playwright/test';

import { signUpData } from '../data/signUpData';
import { fillSignUpForm } from '../functions/fillSignUpForm';
import { logIn } from '../functions/logIn';
import { signOut } from '../functions/signOut';

test.describe('page designer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test.afterEach(async ({ page }) => {

  });

  test('page designer test', async ({ page }) => {
    await logIn(page, signUpData.subDomain, signUpData.password);
    await page.goto('/admin/Page/new');
    await page.locator('div').filter({ hasText: /^Accordion$/ }).click();
    await page.locator('div').filter({ hasText: /^Alert$/ }).click();
    await page.getByText('Breadcrumbs').click();
    await page.locator('div').filter({ hasText: /^Button$/ }).click();
    await page.getByText('Checkbox').click();
  });
});
