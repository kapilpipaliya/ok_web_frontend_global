import { getDriver, isIntegerId } from "~/cypher_api/server/driver";
import {
  Node,
  QueryResult,
  RecordShape,
  Relationship,
  Session,
  types,
} from "neo4j-driver";
import { NumberOrInteger } from "neo4j-driver-core/types/graph-types";
import { Vertex, Edge } from "~/lib/graph/graph";
import { convertNodeToJson, convertRelationshipToJson } from "../../lib/convertNodeToJson";

// Example function to initiate data processing based on some condition

export async function getInitialData(args: {
  subdomain: string;
}): Promise<{ [key: string]: any }> {
  const nodes: Vertex[] = [];
  const relationships: Edge[] = [];
  const vertexLabelIdMap: VertexLabelIdMap = new Map();
  const nodeObj: JsonData = {};
  const relationshipObj: JsonData = {};
  const session = (await getDriver(args.subdomain)).session();
  // 1. get all coll nodes.
  // 2. if no memberKey send all public nodes and relationships.
  // 3. if memberKey, send data that user is allowed to see.
  // 4. if super admin, send all data.
  const superAdmin = false; // This would typically be determined based on session or user credentials

  if (superAdmin) {
    await fetchFromMGAndSaveToArray(
      session,
      "MATCH (n) RETURN n",
      {},
      nodes,
      relationships,
      vertexLabelIdMap,
    );
    await fetchFromMGAndSaveToArray(
      session,
      "MATCH ()-[r]->() RETURN r",
      {},
      nodes,
      relationships,
      vertexLabelIdMap,
    );
  }

  // disable auth temparary
  // else if (memberKey != -1)
  else if (true) {
    // temporary sending all data to logged in member:
    // get web component category id
    // MATCH (c:CompCategory) WHERE c.name = 'View' return c
    // get all web components nodes.
    // MATCH (c:Comp)-[]->(p) RETURN c, p
    // get all web components edges.
    // MATCH (c:Comp)-[cp]->()-[cp2]->() RETURN cp, cp2
    if (!args.admin) {
      const labelVec = ["CompProp", "CompEvent"];
      const typeVec = [
        "CompProp",
        "CompEvent",
        "CompPropDataType",
        "CompPropComp",
        "AttrPropName",
      ];
      await fetchFromMGAndSaveToArray(
        session,
        "MATCH (n) WHERE NOT all(l IN LABELS(n) WHERE l IN $labels) RETURN n",
        { labels: labelVec },
        nodes,
        relationships,
        vertexLabelIdMap,
      );
      await fetchFromMGAndSaveToArray(
        session,
        "MATCH ()-[r]->() WHERE NOT type(r) in $types RETURN r",
        { types: typeVec },
        nodes,
        relationships,
        vertexLabelIdMap,
      );
      // send View Components:
      // get view compnents
      // await fetchFromMGAndSaveToArray("MATCH (ca:CompCategory {name: 'View'})-[]->(n:Comp) return DISTINCT n;",{}, nodes,relationships, vertexLabelIdMap,);
      // get view compnents properties
      await fetchFromMGAndSaveToArray(
        session,
        "MATCH (ca:CompCategory {name: 'View'})-[]->(:Comp)-[]->(n) return DISTINCT n;",
        {},
        nodes,
        relationships,
        vertexLabelIdMap,
      );
      await fetchFromMGAndSaveToArray(
        session,
        "MATCH (ca:CompCategory {name: 'View'})-[]->(:Comp)-[r]->() return DISTINCT r;",
        {},
        nodes,
        relationships,
        vertexLabelIdMap,
      );
      await fetchFromMGAndSaveToArray(
        session,
        "MATCH (ca:CompCategory {name: 'View'})-[]->(:Comp)-[]->()-[r]->() return DISTINCT r;",
        {},
        nodes,
        relationships,
        vertexLabelIdMap,
      );
      await fetchFromMGAndSaveToArray(
        session,
        "MATCH (ca:CompCategory {name: 'View'})-[]->(:Comp)-[]->()<-[r]-() return DISTINCT r;",
        {},
        nodes,
        relationships,
        vertexLabelIdMap,
      );
    } else {
      await fetchFromMGAndSaveToArray(
        session,
        "MATCH (n) RETURN n",
        {},
        nodes,
        relationships,
        vertexLabelIdMap,
      );
      await fetchFromMGAndSaveToArray(
        session,
        "MATCH ()-[r]->() RETURN r",
        {},
        nodes,
        relationships,
        vertexLabelIdMap,
      );
    }
  } else {
    const getAllNodesWithALabel = (label: string, condition: string) => {
      return `MATCH (n:${label}) ${condition} RETURN n`;
    };

    // Prepare the query with label and condition
    const query = getAllNodesWithALabel("Coll", "WHERE n.public = true");
    const response = await session.run(query);

    if (response.records.length === 0) {
      console.error("No data returned or error occurred");
      return {};
    }

    const labelVec = [
      "DataType",
      "Comp",
      "CompProp",
      "Attr",
      "Coll",
      "CollAttr",
      "CollAttrProp",
      "Nav",
      "NavAttr",
    ];
    const getNamesFromResponse = getNamesFromMGResponse(response);
    for (const id of getNamesFromResponse) {
      labelVec.push(id);
    }

    await fetchFromMGAndSaveToArray(
      session,
      "MATCH (n) WHERE all(l IN LABELS(n) WHERE l IN $labels) RETURN n",
      { labels: labelVec },
      nodes,
      relationships,
      vertexLabelIdMap,
    );
    await fetchFromMGAndSaveToArray(
      session,
      `MATCH (n)-[r]->(m) "
                "WHERE all(l IN LABELS(n) WHERE l IN $labels) AND "
                "all(l IN LABELS(m) WHERE l IN $labels) "
                "RETURN r;`,
      { labels: labelVec },
      nodes,
      relationships,
      vertexLabelIdMap,
    );
  }

  getNodeAndEdgeObj(
    nodes,
    relationships,
    vertexLabelIdMap,
    nodeObj,
    relationshipObj,
  );
  await session.close();
  return {
    timestamp: new Date().getTime(),
    vertexes: nodeObj,
    vertexLabelIdMap: convertMapToObject(vertexLabelIdMap),
    edges: relationshipObj,
  };
} // Manipulates the provided node and relationship data into specific JSON objects and maps

export function getNodeAndEdgeObj(
  nodes: Vertex[],
  relationships: Edge[],
  vertexLabelIdMap: VertexLabelIdMap,
  nodeObj: JsonData,
  relationshipObj: JsonData,
): void {
  for (const node of nodes) {
    nodeObj[node.id] = node;
    for (const label of node.L) {
      const id = parseInt(node.id);
      if (!vertexLabelIdMap.has(label)) {
        vertexLabelIdMap.set(label, new Set([id]));
      } else {
        vertexLabelIdMap.get(label)!.add(id);
      }
    }
  }

  for (const relationship of relationships) {
    relationshipObj[relationship.id] = relationship;
  }
}

export type VertexLabelIdMap = Map<string, Set<number>>;
export type JsonData = Record<string, any>;

function getJsonFromPart(
  matchPart: Node | Relationship | Array<Node | Relationship>,
): Vertex | Edge | (Vertex | Edge)[] | {} {
  if (matchPart instanceof types.Node) {
    return convertNodeToJson(matchPart);
  } else if (matchPart instanceof types.Relationship) {
    return convertRelationshipToJson(matchPart);
  } else if (Array.isArray(matchPart)) {
    const list: (Vertex | Edge)[] = [];
    for (const item of matchPart) {
      if (item instanceof types.Node) {
        list.push(convertNodeToJson(item));
      } else if (item instanceof types.Relationship) {
        list.push(convertRelationshipToJson(item));
      }
    }
    return list;
  }
  return {};
}

export async function fetchFromMGAndSaveToArray(
  session: Session,
  query: string,
  params: Record<string, any>,
  nodes: Vertex[],
  relationships: Edge[],
  vertexLabelIdMap: VertexLabelIdMap,
): Promise<{
  nodes: Vertex[];
  relationships: Edge[];
  labelIdMap: VertexLabelIdMap;
}> {
  try {
    const result = await session.run(query, params);

    for (const record of result.records) {
      record.forEach((value) => {
        if (value instanceof types.Node) {
          const id = !isIntegerId ? value.identity.toNumber() : value.identity;
          for (const label of value.labels) {
            if (!vertexLabelIdMap.has(label)) {
              vertexLabelIdMap.set(label, new Set<number>());
            }
            vertexLabelIdMap.get(label)!.add(id);
          }
          nodes.push(convertNodeToJson(value));
        } else if (value instanceof types.Relationship) {
          relationships.push(convertRelationshipToJson(value));
        } else if (Array.isArray(value)) {
          for (const item of value) {
            const id = !isIntegerId ? item.identity.toNumber() : item.identity;
            if (item instanceof types.Node) {
              for (const label of item.labels) {
                if (!vertexLabelIdMap.has(label)) {
                  vertexLabelIdMap.set(label, new Set<number>());
                }
                vertexLabelIdMap.get(label)!.add(id);
              }
              nodes.push(convertNodeToJson(item));
            } else if (item instanceof types.Relationship) {
              relationships.push(convertRelationshipToJson(item));
            }
          }
        }
      });
    }

    return { nodes, relationships, labelIdMap: vertexLabelIdMap };
  } catch (error) {
    console.error("Failed to execute query:", query, "Error:", error);
    throw error;
  }
}

// async function reconnect(): Promise<void> {
//   await getDriver('super').close();
//   session = getDriver('super').session();
//   console.log('Reconnected to the database');
// }
// Function to extract names from the graph database response

export function getNamesFromMGResponse(
  response: QueryResult<RecordShape<PropertyKey, any>>,
): string[] {
  const collections: string[] = [];

  for (const record of response.records) {
    record.forEach((value, key) => {
      if (value instanceof types.Node) {
        //  && value.labels.includes('YourLabel')
        const nameProperty = value.properties["name"];
        if (nameProperty) {
          collections.push(nameProperty);
        } else {
          console.warn(`Can't find name for: ${value.identity.toString()}`);
        }
      }
    });
  }

  return collections;
}

// Function to convert a Map<string, Set<number>> to an object with array values

export function convertMapToObject(
  map: VertexLabelIdMap,
): Record<string, number[]> {
  const result: Record<string, number[]> = {};

  map.forEach((value, key) => {
    result[key] = Array.from(value);
  });

  return result;
}
