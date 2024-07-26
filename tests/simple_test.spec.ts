import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/auth/login');

  await page.getByPlaceholder('Your email or username').click();
  await page.getByPlaceholder('Your email or username').fill('kapil13@gmail.com');
  await page.getByPlaceholder('Your email or username').press('Tab');

  await page.getByPlaceholder('Your Password').fill('kK11235813@');

  await page.getByPlaceholder('Your Password').press('Tab');

  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(page).toHaveURL('http://localhost:3000/admin/Page');

  await page.getByRole('button', { name: 'Add New' }).click();

  await page.getByRole('button', { name: 'Layout' }).click();

  await page.getByRole('button', { name: 'SEO' }).click();

  await page.getByRole('button', { name: 'Rules' }).click();
  await page.getByRole('button', { name: 'Add New Rule' }).click();
  await page.getByRole('menu').getByText('Add New Rule').click();

  await page.getByRole('button', { name: 'Settings' }).click();

  await page.getByRole('button', { name: 'Templates' }).click();

  await page.getByRole('button', { name: 'Forms' }).click();

  await page.locator('aside').filter({ hasText: 'ComponentsTemplatesFormsPagesThank YouError PagesEmail' }).getByRole('img').first().click();
  await page.getByRole('complementary').getByRole('img').click();
  await page.locator('div:nth-child(3) > .border-radius\\:5px').click();
  
  await page.getByRole('button', { name: 'Add Form Element' }).click();
  
  await page.getByRole('button', { name: 'Templates' }).click();
  
  await page.getByRole('button', { name: 'Rules' }).click();
  await page.getByRole('button', { name: 'Add New Rule' }).click();
  await page.getByRole('menu').getByText('Add New Rule').click();
  
  await page.getByText('SEO Title').click();
});


