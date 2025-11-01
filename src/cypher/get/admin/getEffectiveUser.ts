import type { Session } from "neo4j-driver";
import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import {Vertex} from "~/lib/graph/type/vertex";

/**
 * Core platform function: Returns impersonated user if admin is impersonating,
 * otherwise returns the actual user.
 * No YTO-specific logic - works for any website.
 *
 * @param session - Neo4j database session
 * @param actualUser - The currently authenticated user
 * @param contextData - Optional context data containing impersonatedUserId
 * @returns The effective user (either actual or impersonated)
 */
export async function getEffectiveUser(
  session: Session,
  actualUser: Vertex,
  contextData?: { impersonatedUserId?: string }
): Promise<Vertex> {
  // If no impersonation requested, return actual user
  if (!contextData?.impersonatedUserId) {
    return actualUser;
  }

  // Verify actual user is admin
  const adminCheck = await session.run(
    `MATCH (u:User)-[:UserRole]->(r:Role {key: "Admin"})
     WHERE u.uuid = $userId
     RETURN u`,
    { userId: actualUser.P.uuid }
  );

  if (adminCheck.records.length === 0) {
    throw new Error("Only admins can impersonate users");
  }

  // Get impersonated user
  const impersonatedResult = await session.run(
    `MATCH (u:User {uuid: $uuid}) RETURN u`,
    { uuid: contextData.impersonatedUserId }
  );

  if (impersonatedResult.records.length === 0) {
    throw new Error("Impersonated user not found");
  }

  return convertNodeToJson(impersonatedResult.records[0].get('u'));
}
