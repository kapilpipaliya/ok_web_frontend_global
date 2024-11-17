import { expect, test } from '@playwright/test';

import { signUpData } from '../data/signUpData';
import { fillSignUpForm } from '../functions/fillSignUpForm';
import { logIn } from '../functions/logIn';
import { signOut } from '../functions/signOut';

test.describe('admin login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test.afterEach(async ({ page }) => {

  });

  test('admin login test', async ({ page }) => {
    await logIn(page, signUpData.subDomain, signUpData.password);
  });
});
