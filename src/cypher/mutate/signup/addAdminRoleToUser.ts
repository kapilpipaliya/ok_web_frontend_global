import type { Session, Transaction } from "neo4j-driver";

export async function addAdminRoleToUser(
  sessionOrTx: Session | Transaction,
  uuid: string,
) {
  // First check if the Admin role exists, create it if it doesn't
  const checkRoleQuery = `
    MERGE (r:Role {key: 'Admin'})
    ON CREATE SET r.name = 'Administrator', r.createdAt = datetime()
    RETURN r
  `;
  
  await sessionOrTx.run(checkRoleQuery);
  
  // Then create the relationship
  const query = `
    MATCH (u:User {uuid: $uuid}), (r:Role {key: 'Admin'})
    MERGE (u)-[:UserRole]->(r)
    RETURN u, r
  `;

  const params = { uuid };

  try {
    const result = await sessionOrTx.run(query, params);
    
    if (result.records.length === 0) {
      throw new Error(`Failed to add Admin role to user with UUID: ${uuid}`);
    }
    
    return result;
  } catch (error) {
    console.error("Error adding Admin role to user:", error);
    throw error;
  }
}
