import { int, type Session, type Transaction } from "neo4j-driver";

import type { ComponentNode } from "./ComponentTreeType";

async function addEdgeIfNotExists(
  session: Session | Transaction,
  parentId: number | string,
  childId: number,
): Promise<void> {
  // Check if the edge already exists
  const findEdgeResult = await session.run(
    `MATCH (parent:Comp)<-[r:ParentComp]-(child:Comp)
     WHERE id(parent) = $parentId AND id(child) = $childId
     RETURN r`,
    { childId: childId, parentId: parentId },
  );

  if (findEdgeResult.records.length === 0) {
    // Create the edge if it doesn't exist
    await session.run(
      `MATCH (parent:Comp), (child:Comp)
       WHERE id(parent) = $parentId AND id(child) = $childId
       CREATE (parent)<-[:ParentComp]-(child)`,
      { childId: int(childId), parentId: int(parentId) },
    );
  }
}

export async function insertComponentTree(
  session: Session | Transaction,
  components: ComponentNode[],
  parentId: null | number | string = null,
): Promise<{ success: boolean }> {
  for (const component of components) {
    // Check if the node already exists
    const findNodeResult = await session.run(
      "MATCH (n:Comp {key: $key}) RETURN id(n) AS id",
      { key: component.Component },
    );

    let nodeId: number;

    if (findNodeResult.records.length > 0) {
      nodeId = findNodeResult.records[0].get("id");
    } else {
      // Create the node if it doesn't exist
      const createNodeResult = await session.run(
        `CREATE (n:Comp {key: $key})
         RETURN id(n) AS id`,
        { key: component.Component },
      );
      nodeId = createNodeResult.records[0].get("id");
    }

    if (parentId !== null) {
      await addEdgeIfNotExists(session, parentId, nodeId);
    }

    // Recursively insert the children
    await insertComponentTree(session, component.children || [], nodeId);
  }
  return { success: true };
}
