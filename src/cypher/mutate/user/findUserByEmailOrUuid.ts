import type { Node, RecordShape, Result, Session } from "neo4j-driver";

import { convertNodeToJson } from "~/cypher/conversion/convertNodeToJson";
import { processResult } from "~/cypher/conversion/processResult";
import type { EvalExpressionContext } from "~/cypher/types/EvalExpressionContext";
import type { GraphData } from "~/cypher/types/ServerResult";

import { createUserSetting } from "./createUserSetting";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { UserData } from "~/lib/graph/mutate/user/loadUser";

export async function findUserByEmailOrUuid(
  dbSession: Session,
  email?: null | string,
  uuid?: null | string,
): Promise<UserData> {
  if (!(email || uuid)) {
    return getGuestOnlyResult(dbSession);
  }

  const result = await findUserInternal(dbSession, uuid!, email!, true);

  if (!result || result.records.length === 0) {
    return getGuestOnlyResult(dbSession);
  }

  // Create context for relationship processing
  const context: EvalExpressionContext = {
    nodes: {},
    relationships: {},
  };

  // Process all nodes and relationships in one call
  processResult(
    result.records,
    context,
    ["u", "s", "p", "g", "roles"],
    ["userSettingRels", "userRoleRels", "profileImageRels"],
  );

  const record = result.records[0];

  // Get user from context (already has IN/OUT populated)
  const userNode = record.get("u") as Node | null;
  const user = userNode ? context.nodes![userNode.elementId] || null : null;

  // Get roles from context (already have IN/OUT populated)
  const rolesNodes = (record.get("roles") as Node[] | null) || [];
  const roles = rolesNodes
    .filter((r) => r !== null)
    .map((roleNode) => context.nodes![roleNode.elementId])
    .filter((r) => r !== undefined);

  // Get other vertices from context (already have IN/OUT populated)
  const settingNode = record.get("s") as Node | null;
  let userSetting = settingNode
    ? context.nodes![settingNode.elementId] || null
    : null;

  const profileNode = record.get("p") as Node | null;
  const profileImage = profileNode
    ? context.nodes![profileNode.elementId] || null
    : null;

  const globalNode = record.get("g") as Node | null;
  const globalSetting = globalNode
    ? context.nodes![globalNode.elementId] || null
    : null;

  if (user && !userSetting) {
    userSetting = (await createUserSetting(dbSession, user.P.uuid)) as Vertex;
  }

  // Build graph structure from context
  const graph: GraphData = {
    vertexes: context.nodes!,
    edges: context.relationships!,
  };

  return {
    globalSetting,
    profileImage,
    roles,
    user,
    userSetting,
    graph,
  };
}

async function findUserInternal(
  dbSession: Session,
  uuid: null | string,
  emailOrUsername: null | string,
  addOptionalData = false
): Promise<null | Result<RecordShape>> {
  if (!(emailOrUsername || uuid)) {
    return null;
  }

  let query = "";

  if (uuid) {
    query = `
    MATCH (u:User {uuid: $uuid})
    `;
  } else if (emailOrUsername) {
    query = `
    MATCH (u:User)
    WHERE u.email = $emailOrUsername OR u.username = $emailOrUsername
    `;
  } else {
    query = `
    MATCH (u:User)
    `;
  }

  if (addOptionalData) {
    query += `
      OPTIONAL MATCH (u)-[rel1:UserSetting]->(s:UserSetting)
      OPTIONAL MATCH (u)-[rel2:UserRole]->(r:Role)
      OPTIONAL MATCH (u)-[rel3:UserProfileImage]->(p:File)
      OPTIONAL MATCH (g:GlobalSetting)
      RETURN u, s, collect(DISTINCT r) AS roles, p, g,
            collect(DISTINCT rel1) AS userSettingRels,
            collect(DISTINCT rel2) AS userRoleRels,
            collect(DISTINCT rel3) AS profileImageRels
    `;
  } else {
    query += `
    RETURN u
    `;
  }
  return await dbSession.run(query, { emailOrUsername, uuid });
}

export async function findUserVertexSimple(
  dbSession: Session,
  uuid: string,
  emailOrUsername: null | string,
  
): Promise<null | Vertex> {

  const result = await findUserInternal(dbSession, uuid, emailOrUsername);
  if (!result || result.records.length === 0) {
    return null;
  }

  return convertNodeToJson(result.records[0].get("u") as Node);
}

async function getGuestOnlyResult(dbSession: Session): Promise<UserData> {
  const guestRole = await getGuestRole(dbSession);
  const globalSetting = await getGlobalSetting(dbSession);
  return {
    globalSetting,
    profileImage: null,
    roles: [guestRole],
    user: null,
    userSetting: null,
  };
}

async function getGuestRole(dbSession: Session): Promise<Vertex> {
  const guestQuery = `
    MATCH (r:Role {key: 'Guest'})
    RETURN r
  `;
  const guestResult = await dbSession.run(guestQuery);
  return convertNodeToJson(guestResult.records[0].get("r") as Node);
}

async function getGlobalSetting(dbSession: Session): Promise<Vertex | null> {
  try {
    const query = `
      MATCH (g:GlobalSetting)
      RETURN g
      LIMIT 1
    `;
    const result = await dbSession.run(query);

    if (result.records.length === 0) {
      return null;
    }

    return convertNodeToJson(result.records[0].get("g") as Node);
  } catch (error) {
    console.warn("Failed to fetch GlobalSetting:", error);
    return null;
  }
}
