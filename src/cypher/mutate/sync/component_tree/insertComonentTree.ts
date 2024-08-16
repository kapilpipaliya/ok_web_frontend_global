import { int, type Session } from "neo4j-driver";

import type { ComponentNode } from "./ComponentTreeType";

export async function insertComponentTree(
  session: Session,
  components: ComponentNode[],
  parentId: null | number | string = null
): Promise<{ success: boolean }> {
  for (const component of components) {
    // Check if the node already exists
    const findNodeResult = await session.run(
      "MATCH (n:Comp {name: $name}) RETURN id(n) AS id",
      { name: component.Component }
    );

    let nodeId: number;

    if (findNodeResult.records.length > 0) {
      nodeId = findNodeResult.records[0].get("id");
    } else {
      // Create the node if it doesn't exist
      const createNodeResult = await session.run(
        `CREATE (n:Comp {name: $name})
         RETURN id(n) AS id`,
        { name: component.Component }
      );
      nodeId = createNodeResult.records[0].get("id");
    }

    if (parentId !== null) {
      // Check if the edge already exists
      const findEdgeResult = await session.run(
        `MATCH (parent:Comp)<-[r:ParentComp]-(child:Comp)
         WHERE id(parent) = $parentId AND id(child) = $childId
         RETURN r`,
        { childId: nodeId, parentId: parentId }
      );

      if (findEdgeResult.records.length === 0) {
        // Create the edge if it doesn't exist
        await session.run(
          `MATCH (parent:Comp), (child:Comp)
           WHERE id(parent) = $parentId AND id(child) = $childId
           CREATE (parent)<-[:ParentComp]-(child)`,
          { childId: int(nodeId), parentId: int(parentId) }
        );
      }
    }

    // Recursively insert the children
    await insertComponentTree(session, component.children || [], nodeId);
  }
  return { success: true };
}
