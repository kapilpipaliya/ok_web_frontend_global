import { int, type Session, type Transaction } from "neo4j-driver";

import type { ComponentNode } from "./ComponentTreeType";

import { corvuComponentUrls } from "../component_properties/corvu-components";
import { kobalteComponentUrls } from "../component_properties/kobalte-components";

async function addEdgeIfNotExists(
  dbSession: Session | Transaction,
  parentId: number | string,
  childId: number,
): Promise<void> {
  // Check if the edge already exists
  const findEdgeResult = await dbSession.run(
    `MATCH (parent:Comp)<-[r:ParentComp]-(child:Comp)
     WHERE id(parent) = $parentId AND id(child) = $childId
     RETURN r`,
    { childId: childId, parentId: parentId },
  );

  if (findEdgeResult.records.length === 0) {
    // Create the edge if it doesn't exist
    await dbSession.run(
      `MATCH (parent:Comp), (child:Comp)
       WHERE id(parent) = $parentId AND id(child) = $childId
       CREATE (parent)<-[:ParentComp]-(child)`,
      { childId: int(childId), parentId: int(parentId) },
    );
  }
}

export async function insertComponentTree(
  dbSession: Session | Transaction,
  components: ComponentNode[],
  parentId: null | number | string = null,
): Promise<{ success: boolean }> {
  for (const component of components) {
    // Get the component URL from corvu or kobalte
    const componentUrl =
      corvuComponentUrls[
        component.Component as keyof typeof corvuComponentUrls
      ] ||
      kobalteComponentUrls[
        component.Component as keyof typeof kobalteComponentUrls
      ] ||
      null;

    // Check if the node already exists
    const findNodeResult = await dbSession.run(
      "MATCH (n:Comp {key: $key}) RETURN id(n) AS id",
      { key: component.Component },
    );

    let nodeId: number;

    if (findNodeResult.records.length > 0) {
      nodeId = findNodeResult.records[0].get("id");
    } else {
      // Create the node if it doesn't exist, including the 'info' property
      const createNodeResult = await dbSession.run(
        `CREATE (n:Comp {key: $key, info: $info})
         RETURN id(n) AS id`,
        { info: componentUrl, key: component.Component },
      );
      nodeId = createNodeResult.records[0].get("id");
    }

    if (parentId !== null) {
      await addEdgeIfNotExists(dbSession, parentId, nodeId);
    }

    // Recursively insert the children
    await insertComponentTree(dbSession, component.children || [], nodeId);
  }
  return { success: true };
}
