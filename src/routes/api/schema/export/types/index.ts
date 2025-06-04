import type { Node, Relationship } from "neo4j-driver";

export interface ExportStats {
  exportedComponents: string[];
  exportedPages: string[];
  totalVertices: number;
  totalEdges: number;
}

export interface CollectedData {
  vertices: Node[];
  edges: Relationship[];
}
