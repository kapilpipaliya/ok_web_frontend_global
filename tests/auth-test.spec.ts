import { test, expect } from '@playwright/test';
import { signIn } from './utils/auth';

test('test', async ({ page }) => {
  await signIn(page, 'admin', 'kK11235813@', '/admin/Page/new');
  
  // Add assertion to verify successful signIn
  await expect(page).toHaveURL(/.*\/admin\/Page\/new/);
});