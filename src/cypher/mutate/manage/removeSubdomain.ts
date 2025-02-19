import { expect } from "playwright/test";

import { getDriver } from "~/cypher/driver";

// Not used in the project yet.
export async function removeAdmin(subDomain: string) {
  const dbSession = (await getDriver()).session({ database: "super" });
  const getSubDomainQuery = `MATCH (s:SubDomain { key: $subDomain })-[:UserSubDomain]-(u:User)
        RETURN u`;
  try {
    const getUser = await dbSession.run(getSubDomainQuery, {
      subDomain: subDomain,
    });
    expect(getUser.records.length).toBe(1);

    const user = getUser.records[0].get("u");

    // Check if the user has multiple subDomains
    const checkMultipleSubDomainsQuery = `
    MATCH (u:User)-[:UserSubDomain]->(s:SubDomain)
    WHERE elementId(u) = $id
    RETURN count(s) as subDomainCount
    `;
    const subDomainCountResult = await dbSession.run(
      checkMultipleSubDomainsQuery,
      { id: user.identity },
    );

    const subDomainCount =
      subDomainCountResult.records[0].get("subDomainCount");
    expect(subDomainCount, "User has multiple subDomains. Cannot delete.").toBe(
      1,
    );

    // Delete the edge between User and SubDomain
    const deleteEdgeQuery = `
    MATCH (u:User)-[r:UserSubDomain]->(s:SubDomain { key: $subDomain })
    WHERE elementId(u) = $id
    DELETE r
    `;
    await dbSession.run(deleteEdgeQuery, {
      id: user.identity,
      subDomain: subDomain,
    });

    // Delete the User
    const deleteUserQuery = `
    MATCH (u:User)
    WHERE elementId(u) = $id
    DETACH DELETE u
    `;
    const deleteResult = await dbSession.run(deleteUserQuery, {
      id: user.identity,
    });

    expect(deleteResult.summary.counters.updates().nodesDeleted).toBe(1);

    // Remove the SubDomain vertex
    const deleteSubDomainQuery = `
    MATCH (s:SubDomain { key: $subDomain })
    DELETE s
    `;
    await dbSession.run(deleteSubDomainQuery, { subDomain: subDomain });

    // Verify the subDomain was removed
    const verifyResult = await dbSession.run(getSubDomainQuery, {
      subDomain: subDomain,
    });

    expect(verifyResult.records.length).toBe(0); // Expect no results, indicating subDomain was removed
  } finally {
    await dbSession.close();
  }
}
