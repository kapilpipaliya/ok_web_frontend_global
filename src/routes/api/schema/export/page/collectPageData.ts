import type { Node, Relationship, Session } from "neo4j-driver";
import type { CollectedData } from "../types";
import { fetchPageById } from "./fetchPageById";
import { fetchAttrHierarchy } from "../shared/fetchAttrHierarchy";
import { fetchAttrSrcFiles } from "../shared/fetchAttrSrcFiles";
import { fetchRolePermissions } from "./fetchRolePermissions";
import { fetchPageUnique } from "./fetchPageUnique";

export async function collectPageData(
  dbSession: Session,
  pageKey: string,
): Promise<CollectedData> {
  const page = await fetchPageById(dbSession, pageKey);
  if (!page) {
    return { vertices: [], edges: [] };
  }

  const allVertices: Node[] = [page];
  const allEdges: Relationship[] = [];

  // Fetch Attr hierarchy
  const attrData = await fetchAttrHierarchy(dbSession, page, "Page");
  allVertices.push(...attrData.vertices);
  allEdges.push(...attrData.edges);

  // Fetch AttrSrc files
  // Include both Attr nodes and the page itself (in case it has AttrSrc)
  const attrNodes = [
    ...attrData.vertices.filter((v) => v.labels.includes("Attr")),
    page,
  ];
  const fileData = await fetchAttrSrcFiles(dbSession, attrNodes);
  allVertices.push(...fileData.vertices);
  allEdges.push(...fileData.edges);

  // Fetch role permissions
  const roleData = await fetchRolePermissions(dbSession, pageKey);
  allVertices.push(...roleData.vertices);
  allEdges.push(...roleData.edges);

  // Fetch page unique constraints
  const uniqueData = await fetchPageUnique(dbSession, pageKey);
  allVertices.push(...uniqueData.vertices);
  allEdges.push(...uniqueData.edges);

  return { vertices: allVertices, edges: allEdges };
}
