import { expect, test } from '@playwright/test';
import Docker from 'dockerode';

import { waitForDockerCreate } from '~/cypher/mutate/signup/waitForDockerCreate';

test.describe('super user setup', () => {
  let docker: Docker;

  test.beforeAll(async () => {
    test.setTimeout(300000);
    docker = new Docker();
    const containers = await docker.listContainers();
    const superContainer = containers.find(container => container.Names.includes('/super'));
    
    if (!superContainer) {
      const driverPort = 1102;
      const logsPort = 1103;
      const labPort = 1104;
      await waitForDockerCreate("super", driverPort, logsPort, labPort);
    }
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
    const userText = await page.getByText('{"id":"0","IN":{},"L":["User');
    await expect(userText).toBeVisible();
    await page.goto('/api/mutate/insert_comp_tree');
    const successMessage = await page.getByText('{"success":true}');
    await expect(successMessage).toBeVisible();
  });
});
