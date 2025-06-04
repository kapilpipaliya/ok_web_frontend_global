import type { Node, Relationship, Session } from "neo4j-driver";
import type { CollectedData } from "../types";
import { fetchComponentById } from "./fetchComponentById";
import { fetchComponentVariants } from "./fetchComponentVariants";
import { fetchAttrHierarchy } from "../shared/fetchAttrHierarchy";
import { fetchAttrSrcFiles } from "../shared/fetchAttrSrcFiles";

export async function collectComponentData(
  dbSession: Session,
  componentKey: string,
): Promise<CollectedData> {
  const component = await fetchComponentById(dbSession, componentKey);
  if (!component) {
    return { vertices: [], edges: [] };
  }

  const allVertices: Node[] = [component];
  const allEdges: Relationship[] = [];

  // Fetch component variants and options
  const variantData = await fetchComponentVariants(dbSession, componentKey);
  allVertices.push(...variantData.vertices);
  allEdges.push(...variantData.edges);

  // Fetch Attr hierarchy
  const attrData = await fetchAttrHierarchy(dbSession, component, "Component");
  allVertices.push(...attrData.vertices);
  allEdges.push(...attrData.edges);

  // Fetch AttrSrc files
  // Include both Attr nodes and the component itself (in case it has AttrSrc)
  const attrNodes = [
    ...attrData.vertices.filter((v) => v.labels.includes("Attr")),
    component,
  ];
  const fileData = await fetchAttrSrcFiles(dbSession, attrNodes);
  allVertices.push(...fileData.vertices);
  allEdges.push(...fileData.edges);

  return { vertices: allVertices, edges: allEdges };
}
