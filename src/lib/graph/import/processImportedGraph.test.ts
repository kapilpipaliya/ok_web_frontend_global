import { describe, it, expect } from "vitest";
import { processImportedGraph } from "~/lib/graph/import/processImportedGraph";
import { importGraphStructure } from "~/lib/graph/import/importGraphStructure";
import {
  createGraphWithGlobalStore,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("processImportedGraph", () => {
  it("uses imported Page vertex as parent without creating wrapper", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({ newVertexId_: 10 });
    const imported = importGraphStructure(
      {
        vertexes: [{ id: "p-old", L: "Page", P: { key: "Imported" }, IN: {}, OUT: {} }],
        edges: [],
      },
      graph,
      setGraph,
    );
    const result = processImportedGraph(imported, graph, setGraph);
    const pageId = imported.vertexIdMap.get("p-old")!;
    expect(result.parentId).toBe(pageId);
    expect(result.attrRootIds).toEqual([]);
  });

  it("reuses existing page in graph by key", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({ newVertexId_: 10 });
    const existing = createVertex("page-existing", ["Page"], { key: "Page" });
    seedVertex(setGraph, existing);
    const imported = importGraphStructure(
      {
        vertexes: [{ id: "a-old", L: "Attr", P: { key: "x" }, IN: {}, OUT: {} }],
        edges: [],
      },
      graph,
      setGraph,
    );
    const result = processImportedGraph(imported, graph, setGraph, "Page", "Page");
    expect(result.parentId).toBe("page-existing");
  });

  it("creates parent and links attr roots and other label groups", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({ newVertexId_: 50 });
    const imported = importGraphStructure(
      {
        vertexes: [
          { id: "attr-old", L: "Attr", P: { key: "field" }, IN: {}, OUT: {} },
          { id: "layout-old", L: "PageLayout", P: { key: "L1" }, IN: {}, OUT: {} },
        ],
        edges: [],
      },
      graph,
      setGraph,
    );

    const result = processImportedGraph(imported, graph, setGraph, "Page", "NewPage");
    expect(graph.vertexes[result.parentId].P.key).toBe("NewPage");
    expect(result.attrRootIds.length).toBe(1);
    expect(result.labelGroups.get("PageLayout")).toHaveLength(1);
    expect(graph.vertexes[result.parentId].OUT.Attr?.length).toBeGreaterThan(0);
    expect(graph.vertexes[result.parentId].OUT.PageLayout?.length).toBeGreaterThan(0);
  });
});
