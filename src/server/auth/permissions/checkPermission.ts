import type { Session } from "neo4j-driver";
import { getUserFromSession } from "../session/getUserFromSession";
import { SYSTEM_ROLES, PERMISSIONS } from "./types";

export async function checkPermission(
  request: Request,
  permission: string | string[],
  dbSession: Session
): Promise<boolean> {
  const user = await getUserFromSession(request);
  
  if (!user?.id) {
    return false;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  
  // Check if user has any of the required permissions
  const result = await dbSession.run(
    `MATCH (u:User)-[:UserRole]->(r:Role)-[:HasPermission]->(p:Permission)
     WHERE elementId(u) = $userId AND p.key IN $permissions
     RETURN count(p) > 0 as hasPermission`,
    { 
      userId: user.id,
      permissions 
    }
  );

  return result.records[0]?.get("hasPermission") || false;
}

export async function checkRole(
  request: Request,
  role: string | string[],
  dbSession: Session
): Promise<boolean> {
  const user = await getUserFromSession(request);
  
  if (!user?.id) {
    return false;
  }

  const roles = Array.isArray(role) ? role : [role];

  const result = await dbSession.run(
    `MATCH (u:User)-[:UserRole]->(r:Role)
     WHERE elementId(u) = $userId AND r.key IN $roles
     RETURN count(r) > 0 as hasRole`,
    { 
      userId: user.id,
      roles 
    }
  );

  return result.records[0]?.get("hasRole") || false;
} 