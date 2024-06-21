import neo4j, { type Session, type Node, int } from "neo4j-driver";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";
import { evalAsync } from "~/lib/expression_eval";
import jsep from "jsep";
import type { Edge, EdgeMap, Vertex, VertexMap } from "~/lib/graph/graph";
import { convertNodeToJson } from "~/lib/convertNodeToJson";
import type { Expression, } from "~/cypher/get/getDataMGCall";
import { getFormMetaDataAsync } from "~/lib/graph/get/async/getFormMetaDataAsync";

// Main function to initiate the migration process.
export async function syncNodesMGCall(args: { userport: string; nodesToTransfer: string[]; }) {
  "use server";

  const nodesToTransfer = args.nodesToTransfer;
  const userport = args.userport;
  // Creating Neo4j driver instances for admin and user sessions.
  const admin = neo4j.driver("bolt://localhost:1102", undefined, {
    disableLosslessIntegers: true,
  });
  const user = neo4j.driver(`bolt://localhost:${userport}`, undefined, {
    disableLosslessIntegers: true,
  });

  console.log("Starting migration process...");
  const sessionSource = admin.session();
  const sessionTarget = user.session();

  try {
    await transferNodeTypes(sessionSource, sessionTarget, nodesToTransfer);
    return {
      error: false,
      message: "Migration completed successfully.",
    };
  } catch (error) {
    console.error("Error migrating nodes:", error);
    return {
      error: true,
      message: "Error migrating nodes.",
    };
  } finally {
    console.log("Closing database sessions...");
    await sessionSource.close();
    await sessionTarget.close();
    console.log("Database sessions closed.");
  }
}

// Function to transfer nodes of specified types.
async function transferNodeTypes(
  sessionSource: Session,
  sessionTarget: Session,
  nodesToTransfer: string[],
) {
  for (const nodeType of nodesToTransfer) {
    const form = await getFormMetaDataAsync(
      nodeType,
    );
    if (form.error) return "Error";
    const { incoming, outgoing }: { incoming: any; outgoing: any } =
      getEdgesFromRowsAttr(form.form!.attributes);

    const result = await processNodeSync(sessionSource, sessionTarget, {
      expression: `g:'${nodeType}'`,
      incoming,
      outgoing,
    }, [], false);
  }
}

export async function processNodeSync(
  sessionSource: Session,
  sessionTarget: Session,
  expression: Expression,
  vertexes: Vertex[],
  inward: boolean,
  createdVertex?: Vertex,
) {
  const context = {
    nodes: {} as VertexMap,
    relationships: {} as EdgeMap,
    vertexes,
    session: sessionSource,
    setChildren: true,
  }
  const mainResult = await evalAsync(jsep(expression.expression), context);

  if (mainResult && mainResult.length > 0) {
    let children: Vertex[] = [];
    if (createdVertex && mainResult.length > 0) {
      const edge = Object.values(context.relationships)[0];
      const outLabel = mainResult[0].L[0];
      children = await addNodeEdges(sessionSource, sessionTarget, createdVertex, mainResult, edge.T, outLabel, inward);
    }

    for (let vertex of mainResult) {
      const newCreatedVertex = children.find(child => child.P.name === vertex.P.name) || await findOrCreateNodeAndUpdateProperties(sessionSource, sessionTarget, vertex, vertex.L[0]);
      if (expression.incoming && expression.incoming.length > 0) {
        for (const exp of expression.incoming) {
          await processNodeSync(sessionSource, sessionTarget, exp, [vertex], true, newCreatedVertex);
        }
      }
      if (expression.outgoing && expression.outgoing.length > 0) {
        for (const exp of expression.outgoing) {
          await processNodeSync(sessionSource, sessionTarget, exp, [vertex], false, newCreatedVertex);

        }
      }
    }
  }

  return {
    result: mainResult,
    graph: {
      vertexes: context.nodes,
      edges: context.relationships,
    },
  };
}

// Function to handle transfer of a single node.
async function findOrCreateNodeAndUpdateProperties( // transferNode
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
    // console.log(`Node ${properties.name} already exists in target database.`);
    createdNode = await updateNodeProperties(
      sessionTarget,
      existingNode,
      properties,
    );
  } else {
    createdNode = await createNode(sessionTarget, nodeType, properties);
  }

  // await addNodeEdges(sessionSource, sessionTarget, nodeType, node, createdNode);

  // console.log("Node successfully transferd or updated.");
  return createdNode;
}

// Function to update properties of an existing node.
async function updateNodeProperties(
  session: Session,
  node: Vertex,
  properties: { [key: string]: any },
) {
  const result = await session.run(
    "MATCH (n) WHERE id(n) = $id SET n += $properties SET n.updatedAt = localDateTime() RETURN n;",
    { id: int(node.id), properties },
  );
  return convertNodeToJson(result.records[0].get("n"));
}

// Function to create a new node.
async function createNode(
  session: Session,
  nodeType: string,
  properties: { [key: string]: any },
) {
  const result = await session.run(
    `CREATE (n:${nodeType}) SET n = $properties SET n.createdAt = localDateTime() RETURN n;`,
    { properties },
  );
  return convertNodeToJson(result.records[0].get("n"));
}

// Function to add edges between nodes based on certain conditions.
async function addNodeEdges(
  sessionSource: Session,
  sessionTarget: Session,
  parentVertex: Vertex,
  superChildrenVertexes: Vertex[],
  type: string,
  outLabel: string,
  inward: boolean
) {
  // Find children with same name in target database if not exists create a node and edge.
  const userChildrenVertexes = await getChildrenOrParentVertex(
    sessionTarget,
    parentVertex.id,
    type,
    outLabel,
    inward
  );
  const results = [] as Vertex[];
  const globalCollections = ['Nav', 'DataType', 'Comp', 'CompCategory', 'Page'];

  for (const superVertex of superChildrenVertexes) {
    const superProperties = { ...superVertex.P };
    let isPropertyExist = false;

    for (const childVertex of userChildrenVertexes) {
      if (superProperties.name === childVertex.P.name) {
        const query =
          "MATCH (a) WHERE id(a) = $childId SET a += $props SET a.updatedAt = localDateTime() RETURN a;";
        const result = await sessionTarget.run(query, {
          childId: int(childVertex.id),
          props: superProperties,
        });
        result.records.forEach(v => results.push(convertNodeToJson(v.get('a'))))
        isPropertyExist = true;
        continue;
      }
    }

    if (!isPropertyExist) {
      let query: string;
      let props: { [key: string]: any } = {};
      if (globalCollections.includes(superVertex.L[0])) {
        const targetNode = await findOrCreateNodeAndUpdateProperties(sessionSource, sessionTarget, superVertex, superVertex.L[0]);
        query = `MATCH (a),(b)
         WHERE id(a) = $parentNodeId
         AND id(b) = $targetNodeId
         CREATE (a)${inward ? "<-" : "-"}[:${type}]${inward ? "-" : "->"}(b) RETURN b;`;
        props = {
          parentNodeId: int(parentVertex.id),
          targetNodeId: int(targetNode.id),
          props: superProperties,
        }
      } else {
        query = `MATCH (a) WHERE id(a) = $parentNodeId
         CREATE (a)${inward ? "<-" : "-"}[:${type}]${inward ? "-" : "->"}(b:${superVertex.L[0]})
         SET b = $props SET b.createdAt = localDateTime() RETURN b;`;
        props = {
          parentNodeId: int(parentVertex.id),
          props: superProperties,
        }
      }
      const result = await sessionTarget.run(query, props);
      result.records.forEach(v => results.push(convertNodeToJson(v.get('b'))))
    }
  }
  return results;
}

// Function to retrieve child vertices of a node based on a specific edge type.
const getChildrenOrParentVertex = async (session: Session, id: string, edgeType: string, endLabel: string, inward: boolean) => {
  const result = await session.run(
    !inward ? `MATCH (n)-[r:${edgeType}]->(m:${endLabel}) WHERE id(n) = $id RETURN m;` : `MATCH (n${endLabel})<-[r:${edgeType}]-(m) WHERE id(n) = $id RETURN m;`,
    { id: int(id) },
  );
  return result.records.map(v => convertNodeToJson(v.get('m')))
};

// Function to find an existing node by name.
async function findExistingNode(
  session: Session,
  nodeType: string,
  name: string,
) {
  const result = await session.run(
    `MATCH (n:${nodeType} {name: $name}) RETURN n;`,
    { name: name },
  );
  return result.records.length > 0 ? convertNodeToJson(result.records[0].get("n")) : null;
}
