import type {Session, Transaction} from "neo4j-driver";

export async function addAdminRoleToUser(
  sessionOrTx: Session | Transaction,
  uuid: string,
) {
  const query = `
    MATCH (u:User {uuid: $uuid}), (r:Role {key: 'Admin'})
    CREATE (u)-[:UserRole]->(r)
  `;

  const params = {uuid};

  try {
    await sessionOrTx.run(query, params);
  } catch (error) {
    console.error("Error adding Admin role to user:", error);
    throw error;
  }
}