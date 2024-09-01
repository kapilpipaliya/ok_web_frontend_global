import { expect, test } from '@playwright/test';

import { getDriver } from "~/cypher/driver";
import { removeDockerContainer } from '~/server/docker/removeDockerContainer';
import { stopDockerContainer } from '~/server/docker/stopDockerContainer';

import { signUpData } from '../data/signUpData';
test.describe('remove admin', () => {
  test.afterEach(async () => {
  });

  test('remove admin and container', async () => {
    await removeAdmin();
    await stopDockerContainer(signUpData.subDomain);
    await removeDockerContainer(signUpData.subDomain);
  });
});

export async function removeAdmin() {
  const dbSession = (await getDriver("super")).session();
  const getSubDomainQuery = `MATCH (s:SubDomain { key: $subDomain })-[:UserSubDomain]-(u:User)
        RETURN u`
  try {
    const getUser = await dbSession.run(
      getSubDomainQuery,
      { subDomain: signUpData.subDomain }
    );
    expect(getUser.records.length).toBe(1);

    const user = getUser.records[0].get("u");

    // Check if the user has multiple subDomains
    const checkMultipleSubDomainsQuery = `
    MATCH (u:User)-[:UserSubDomain]->(s:SubDomain)
    WHERE id(u) = $id
    RETURN count(s) as subDomainCount
    `;
    const subDomainCountResult = await dbSession.run(
      checkMultipleSubDomainsQuery,
      { id: user.identity }
    );

    const subDomainCount = subDomainCountResult.records[0].get("subDomainCount");
    expect(subDomainCount, "User has multiple subDomains. Cannot delete.").toBe(1);

    // Delete the edge between User and SubDomain
    const deleteEdgeQuery = `
    MATCH (u:User)-[r:UserSubDomain]->(s:SubDomain { key: $subDomain })
    WHERE id(u) = $id
    DELETE r
    `;
    await dbSession.run(
      deleteEdgeQuery,
      { id: user.identity, subDomain: signUpData.subDomain }
    );

    // Delete the User
    const deleteUserQuery = `
    MATCH (u:User)
    WHERE id(u) = $id
    DETACH DELETE u
    `;
    const deleteResult = await dbSession.run(
      deleteUserQuery,
      { id: user.identity }
    );

    expect(deleteResult.summary.counters.updates().nodesDeleted).toBe(1);

    // Remove the SubDomain vertex
    const deleteSubDomainQuery = `
    MATCH (s:SubDomain { key: $subDomain })
    DELETE s
    `;
    await dbSession.run(
      deleteSubDomainQuery,
      { subDomain: signUpData.subDomain }
    );

    // Verify the subDomain was removed
    const verifyResult = await dbSession.run(
      getSubDomainQuery,
      { subDomain: signUpData.subDomain }
    );

    expect(verifyResult.records.length).toBe(0);  // Expect no results, indicating subDomain was removed
  } finally {
    await dbSession.close();
  }
}