import { expect, test } from '@playwright/test';
import Docker from 'dockerode';

import { waitForDockerCreate } from '~/cypher/mutate/signup/waitForDockerCreate';
// import { removeDockerContainer } from '~/server/docker/removeDockerContainer';
// import { stopDockerContainer } from '~/server/docker/stopDockerContainer';

test.use({baseURL: 'https://mydomain.com'});
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
    // await stopDockerContainer("super");
    // await removeDockerContainer("super");
  });

  test('super user setup', async ({ page }) => {
    await page.goto('/api/mutate/super_user_setup');

    // Verify that the super user setup was successful
    await expect(page).toHaveURL('/api/mutate/super_user_setup');
    // Add more assertions as needed
    await page.getByText('{"id":"0","IN":{},"L":["User').isVisible();
    await page.goto('/api/mutate/insert_comp_tree');
    await page.getByText('{"success":true}').isVisible();
  });
});
