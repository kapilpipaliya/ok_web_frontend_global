import type { Session } from "neo4j-driver";

import { Vertex } from "~/lib/graph/graph";

export async function checkPermission(
  request: Request,
  permission: string | string[],
  dbSession: Session,
  user?: Vertex,
  permissionKey?: string,
): Promise<{ allowedAccessLevels: string[]; hasPermission: boolean; }> {

  if (!user?.id) {
    return { allowedAccessLevels: [], hasPermission: false };
  }

  const permissions = Array.isArray(permission) ? permission : [permission];

  const permKey = permissionKey || "Perm";
  // Check if user has any of the required permissions and get allowed access levels
  const result = await dbSession.run(
    `MATCH (u:User)-[:UserRole]->(r:Role)-[:Role${permKey}]->(rp:Role${permKey})-[:Role${permKey}${permKey}]->(p:${permKey})
     WHERE elementId(u) = $userId AND p.key IN $permissions
     RETURN count(p) > 0 as hasPermission, collect(DISTINCT rp.access) as allowedAccessLevels`,
    {
      permissions,
      userId: user.id,
    },
  );

  const hasPermission = result.records[0]?.get("hasPermission") || false;
  const allowedAccessLevels = result.records[0]?.get("allowedAccessLevels") || [];

  return { allowedAccessLevels, hasPermission };
}

export async function checkRole(
  request: Request,
  role: string | string[],
  dbSession: Session,
  user?: Vertex,
): Promise<boolean> {
  if (!user?.id) {
    return false;
  }

  const roles = Array.isArray(role) ? role : [role];

  const result = await dbSession.run(
    `MATCH (u:User)-[:UserRole]->(r:Role)
     WHERE elementId(u) = $userId AND r.key IN $roles
     RETURN count(r) > 0 as hasRole`,
    {
      roles,
      userId: user.id,
    },
  );

  return result.records[0]?.get("hasRole") || false;
}
