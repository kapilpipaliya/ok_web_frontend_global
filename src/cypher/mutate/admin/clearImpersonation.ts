import type { Session } from "neo4j-driver";
import {Vertex} from "~/lib/graph/type/vertex";

/**
 * Platform function: Clear impersonation state with audit logging
 * Stops admin from viewing as another user
 *
 * @param session - Neo4j database session
 * @param adminUser - The admin user who is currently impersonating
 * @param impersonatedUserId - UUID of the user being impersonated
 * @returns Success status
 */
export async function clearImpersonation(
  session: Session,
  adminUser: Vertex,
  impersonatedUserId: string
) {
  // Create audit log
  await session.run(
    `MATCH (admin:User {uuid: $adminId})
     MATCH (target:User {uuid: $impersonatedUserId})
     CREATE (admin)-[:AuditLog]->(log:AuditLog {
       key: "audit_" + toString(datetime()) + "_" + randomUUID(),
       action: "clear_impersonation",
       timestamp: datetime(),
       details: "Admin stopped impersonating user"
     })-[:AuditLogTarget]->(target)`,
    { adminId: adminUser.P.uuid, impersonatedUserId }
  );

  return { success: true };
}
