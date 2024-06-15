import neo4j, { type Session, type Node, int } from "neo4j-driver";
import {getEdgesFromRowsAttr} from "~/lib/getEdgesFromRowsAttr";
import {evalAsync} from "~/lib/expression_eval";
import jsep from "jsep";
import type {Vertex} from "~/lib/graph/graph";
import {convertNodeToJson} from "~/lib/convertNodeToJson";
import type {Expression, } from "~/cypher/get/getDataMGCall";
import {getFormMetaDataAsync} from "~/lib/graph/get/async/getFormMetaDataAsync";

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

    const result = await processNodeSync({
      expression: `g:'${nodeType}'`,
      incoming,
      outgoing,
    });

/*    const readResult = await sessionSource.run(
      `MATCH (n:${nodeType}) RETURN n;`,
    );
    // console.log(`Retrieved ${readResult.records.length} ${nodeType} nodes from admin database.`);

    for (const record of readResult.records) {
      await findOrCreateNodeAndProcessEdges(sessionSource, sessionTarget, record.get("n"), nodeType);
    }*/
  }
}

export async function processNodeSync(
  sessionSource: Session,
  sessionTarget: Session,
  expression: Expression,
) {
  const context = {
    nodes: {} as { [key: string]: any },
    relationships: {} as { [key: string]: any },
    vertexes: undefined as any,
  }
  const mainResult = await evalAsync(jsep(expression.expression), context);
  if (mainResult && mainResult.length > 0) {
      for (const vertex of mainResult) {
        const createdVertex = findOrCreateNodeAndProcessEdges(sessionSource, sessionTarget, vertex, vertex.L[0]);
        if (expression.incoming && mainResult && mainResult.length > 0) {
          for (const exp of expression.incoming) {
            context.vertexes = [createdVertex];
            await processNodeSync(sessionSource, sessionTarget, exp);
          }
        }
        if (expression.outgoing && mainResult && mainResult.length > 0) {
          for (const exp of expression.outgoing) {
            context.vertexes = [createdVertex];
            await processNodeSync(sessionSource, sessionTarget, exp);
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
async function findOrCreateNodeAndProcessEdges( // transferNode
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
  node: Node,
  properties: {[key: string]: any},
) {
  const result = await session.run(
    "MATCH (n) WHERE id(n) = $id SET n += $properties SET n.updatedAt = localDateTime() RETURN n;",
    { id: int(node.elementId), properties },
  );
  return result.records[0].get("n");
}

// Function to create a new node.
async function createNode(
  session: Session,
  nodeType: string,
  properties: {[key: string]: any},
) {
  const result = await session.run(
    `CREATE (n:${nodeType}) SET n = $properties SET n.createdAt = localDateTime() RETURN n;`,
    { properties },
  );
  return result.records[0].get("n");
}

// Function to add edges between nodes based on certain conditions.
async function addNodeEdges(
  sessionSource: Session,
  sessionTarget: Session,

  superChildrenVertexes: Vertex[],
  createdNode: Node,
  inward: boolean
) {

    const superChildrenVertexes = await getChildrenOrParentVertex(
      sessionSource,
      node.elementId,
      "CompProp",
      inward
    );
    const userChildrenVertexes = await getChildrenOrParentVertex(
      sessionTarget,
      createdNode.elementId,
      "CompProp",
      inward
    );

    for (const superVertex of superChildrenVertexes) {
      const superProperties = { ...superVertex.P };
      let isPropertyExist = false;

      for (const childVertex of userChildrenVertexes) {
        const userProperties = { ...childVertex.P };
        if (superProperties.name === userProperties.name) {
          const query =
            "MATCH (a) WHERE id(a) = $compPropNodeId SET a += $props SET a.updatedAt = localDateTime() RETURN a;";
          await sessionTarget.run(query, {
            compPropNodeId: int(childVertex.get("m").elementId),
            props: superProperties,
          });
          isPropertyExist = true;
        }
      }
      if (!isPropertyExist) {
        const query =
          "MATCH (a) WHERE id(a) = $compNodeId CREATE (a)-[:CompProp]->(b) SET b = $props SET b.createdAt = localDateTime() RETURN b;";
        await sessionTarget.run(query, {
          compNodeId: int(createdNode.elementId),
          props: superProperties,
        });
      }
    }

}

// Function to retrieve child vertices of a node based on a specific edge type.
const getChildrenOrParentVertex = async (session: Session, elementId: string, edgeType: string, inward: boolean) => {
  const result = await session.run(
    !inward ? `MATCH (n)-[r:${edgeType}]->(m) WHERE id(n) = $id RETURN m;` : `MATCH (n)<-[r:${edgeType}]-(m) WHERE id(n) = $id RETURN m;`,
    { id: int(elementId) },
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
  return result.records.length > 0 ? result.records[0].get("n") : null;
}
