import { test, expect } from '@playwright/test';
import { login } from './utils/auth';

test('test', async ({ page }) => {
  await login(page, 'admin', 'kK11235813@', '/admin/Page/new');
  
  // Add assertion to verify successful login
  await expect(page).toHaveURL(/.*\/admin\/Page\/new/);
});