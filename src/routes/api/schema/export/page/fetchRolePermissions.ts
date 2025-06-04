import type { Session } from "neo4j-driver";
import type { CollectedData } from "../types";

export async function fetchRolePermissions(
  dbSession: Session,
  pageKey: string,
): Promise<CollectedData> {
  const result = await dbSession.run(
    `
    MATCH (p:Page {key: $key})
    OPTIONAL MATCH (p)-[rolePagePageRel:RolePagePage]-(rp:RolePage)
    OPTIONAL MATCH (rp)-[rolePageRel:RolePage]-(role:Role)
    RETURN 
      collect(DISTINCT rp) as rolePages,
      collect(DISTINCT role) as roles,
      collect(DISTINCT rolePagePageRel) as rolePagePageRels,
      collect(DISTINCT rolePageRel) as rolePageRels
  `,
    { key: pageKey },
  );

  if (result.records.length === 0) {
    return { vertices: [], edges: [] };
  }

  const record = result.records[0];
  const vertices = [
    ...(record.get("rolePages") || []),
    ...(record.get("roles") || []),
  ].filter(Boolean);

  const edges = [
    ...(record.get("rolePagePageRels") || []),
    ...(record.get("rolePageRels") || []),
  ].filter(Boolean);

  return { vertices, edges };
}
