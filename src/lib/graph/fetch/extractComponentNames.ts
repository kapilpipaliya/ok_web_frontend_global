import type { VertexMap } from "~/lib/graph/type/vertexMap";

export function extractComponentNames(vertices: VertexMap): Set<string> {
  const componentNames = new Set<string>();

  for (const vertex of Object.values(vertices)) {
    if (
      (vertex.L.includes("Attr") || vertex.L.includes("PageLayout")) &&
      vertex.P.componentName
    ) {
      if (!["Html", "Slot"].includes(vertex.P.componentName)) {
        componentNames.add(vertex.P.componentName);
      }
    }

    if (vertex.L.includes("Page") || vertex.L.includes("Component")) {
      const dyn = vertex.P.dynamicComponent;
      if (Array.isArray(dyn)) {
        for (const name of dyn) {
          if (typeof name === "string" && name.length > 0) {
            componentNames.add(name);
          }
        }
      } else if (typeof dyn === "string") {
        for (const name of dyn.split(",")) {
          const trimmed = name.trim();
          if (trimmed.length > 0) {
            componentNames.add(trimmed);
          }
        }
      }
    }
  }

  return componentNames;
}
