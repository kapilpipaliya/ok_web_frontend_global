// Function to handle transfer of a single node.
import type { Session } from "neo4j-driver";

import type { Vertex } from "~/lib/graph/graph";

import { createNode } from "~/cypher/mutate/sync/createNode";
import { findExistingNode } from "~/cypher/mutate/sync/findExistingNode";
import { updateNodeProperties } from "~/cypher/mutate/sync/updateNodeProperties";

export async function findOrCreateNodeAndUpdateProperties(
  // transferNode
  sessionSource: Session,
  sessionTarget: Session,
  node: Vertex,
  nodeType: string,
) {
  const properties = { ...node.P };
  const existingNode = await findExistingNode(
    sessionTarget,
    nodeType,
    properties.name,
  );

  let createdNode;
  if (existingNode) {
    createdNode = await updateNodeProperties(
      sessionTarget,
      existingNode,
      properties,
    );
  } else {
    createdNode = await createNode(sessionTarget, nodeType, properties);
  }
  return createdNode;
}
