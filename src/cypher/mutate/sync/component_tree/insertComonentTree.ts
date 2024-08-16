import { int, Session } from "neo4j-driver";
import { ComponentNode } from "./ComponentTreeType";

export async function insertComponentTree(
  session: Session,
  components: ComponentNode[],
  parentId: string | null = null
): Promise<void> {
  for (const component of components) {
    // Check if the node already exists
    const findNodeResult = await session.run(
      `MATCH (n:Component {name: $name}) RETURN id(n) AS id`,
      { name: component.Component }
    );

    let nodeId: string;

    if (findNodeResult.records.length > 0) {
      nodeId = findNodeResult.records[0].get("id");
    } else {
      // Create the node if it doesn't exist
      const createNodeResult = await session.run(
        `CREATE (n:Component {name: $name})
         RETURN id(n) AS id`,
        { name: component.Component }
      );
      nodeId = createNodeResult.records[0].get("id");
    }

    if (parentId !== null) {
      // Check if the edge already exists
      const findEdgeResult = await session.run(
        `MATCH (parent:Component)-[r:CompParent]->(child:Component)
         WHERE id(parent) = int($parentId) AND id(child) = int($childId)
         RETURN r`,
        { parentId: int(parentId), childId: int(nodeId) }
      );

      if (findEdgeResult.records.length === 0) {
        // Create the edge if it doesn't exist
        await session.run(
          `MATCH (parent:Component), (child:Component)
           WHERE id(parent) = int($parentId) AND id(child) = int($childId)
           CREATE (parent)-[:CompParent]->(child)`,
          { parentId: int(parentId), childId: int(nodeId) }
        );
      }
    }

    // Recursively insert the children
    await insertComponentTree(session, component.children || [], nodeId);
  }
}
