import { expect, test } from '@playwright/test';

import { getDriver } from '~/cypher/driver';
import { createDatabase } from '~/cypher/mutate/signup/createDatabase';

test.describe('super user setup', () => {

  test.beforeAll(async () => {
    test.setTimeout(300000);
    const driver = await getDriver();
    const session = driver.session();
    const result = await session.run("SHOW DATABASES");

    const superDatabase = result.records.find(record => record.get("name") === "super");

    if (!superDatabase) {
      const driverPort = 1102;
      const logsPort = 1103;
      const labPort = 1104;
      await createDatabase("super", driverPort, logsPort, labPort);
    }

    await session.close();
  });

  test.beforeEach(async ({ page }) => {
  });

  test.afterEach(async ({ page }) => {
    // await removeDockerComposeDirectory("super");
  });

  test('super user setup', async ({ page }) => {
    await page.goto('/api/mutate/super_user_setup');

    // Verify that the super user setup was successful
    await expect(page).toHaveURL('/api/mutate/super_user_setup');
    // Add more assertions as needed
    const userText = await page.getByText('"L":["User"],"OUT":{},"P":');
    await expect(userText).toBeVisible();
    await page.goto('/api/mutate/insert_comp_tree');
    const successMessage = await page.getByText('{"success":true}');
    await expect(successMessage).toBeVisible();
  });
});
