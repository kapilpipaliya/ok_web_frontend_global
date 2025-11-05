import type { Session } from "neo4j-driver";
import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import type { Vertex } from "~/lib/graph/type/vertex";

/**
 * Platform function: Set impersonation state with audit logging
 * Allows admin to view the system as another user
 *
 * @param session - Neo4j database session
 * @param adminUser - The admin user performing the impersonation
 * @param targetUserUuid - UUID of the user to impersonate
 * @returns Impersonation details including the impersonated user
 */
export async function setImpersonation(
  session: Session,
  adminUser: Vertex,
  targetUserUuid: string,
) {
  // Verify admin role
  const adminCheck = await session.run(
    `MATCH (u:User {uuid: $userId})-[:UserRole]->(r:Role {key: "Admin"})
     RETURN u`,
    { userId: adminUser.P.uuid },
  );

  if (adminCheck.records.length === 0) {
    throw new Error("Only admins can impersonate users");
  }

  // Verify target user exists
  const targetResult = await session.run(
    "MATCH (u:User {uuid: $uuid}) RETURN u",
    { uuid: targetUserUuid },
  );

  if (targetResult.records.length === 0) {
    throw new Error("Target user not found");
  }

  const targetUser = convertNodeToJson(targetResult.records[0].get("u"));

  // Create audit log
  await session.run(
    `MATCH (admin:User {uuid: $adminId})
     MATCH (target:User {uuid: $targetUserUuid})
     CREATE (admin)-[:AuditLog]->(log:AuditLog {
       key: "audit_" + toString(datetime()) + "_" + randomUUID(),
       action: "impersonate",
       timestamp: datetime(),
       details: "Admin started impersonating user"
     })-[:AuditLogTarget]->(target)`,
    { adminId: adminUser.P.uuid, targetUserUuid },
  );

  return {
    impersonatedUserUuid: targetUserUuid,
    impersonatedUser: targetUser,
  };
}
