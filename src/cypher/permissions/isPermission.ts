import type { Session, Transaction } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/type/vertex";

export async function checkRole(
  role: string | string[],
  dbSession: Session | Transaction,
  user?: Vertex,
): Promise<boolean> {
  if (!user?.id) {
    return false;
  }

  const roles = Array.isArray(role) ? role : [role];

  const result = await dbSession.run(
    `MATCH (u:User {uuid: $uuid})-[:UserRole]->(r:Role)
     WHERE r.key IN $roles
     RETURN count(r) > 0 as hasRole`,
    {
      roles,
      uuid: user.P.uuid,
    },
  );

  return result.records[0]?.get("hasRole");
}

// still not used in the codebase
export async function isPermission(
  permission: string | string[],
  dbSession: Session,
  user?: Vertex,
  permissionKey?: string,
): Promise<{ allowedAccessLevels: string[]; hasPermission: boolean }> {
  if (!user?.id) {
    return { allowedAccessLevels: [], hasPermission: false };
  }

  const permissions = Array.isArray(permission) ? permission : [permission];

  const permKey = permissionKey || "Perm";
  // Check if user has any of the required permissions and get allowed access levels
  const result = await dbSession.run(
    `MATCH (u:User {uuid: $uuid})-[:UserRole]->(r:Role)-[:Role${permKey}]->(rp:Role${permKey})-[:Role${permKey}${permKey}]->(p:${permKey})
     WHERE p.key IN $permissions
     RETURN count(p) > 0 as hasPermission, collect(DISTINCT rp.access) as allowedAccessLevels`,
    {
      permissions,
      uuid: user.P.uuid,
    },
  );

  const hasPermission = result.records[0]?.get("hasPermission");
  const allowedAccessLevels =
    result.records[0]?.get("allowedAccessLevels") || [];

  return { allowedAccessLevels, hasPermission };
}
