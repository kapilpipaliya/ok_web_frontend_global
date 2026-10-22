import { describe, it, expect, vi } from "vitest";
import { importGraphStructure } from "~/lib/graph/import/importGraphStructure";
import {
  createGraphWithGlobalStore,
  createVertex,
  createEdge,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("importGraphStructure", () => {
  it("creates vertices and edges with remapped ids and finds roots", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({ newVertexId_: 100 });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = importGraphStructure(
      {
        vertexes: [
          { id: "old-root", L: "Page", P: { key: "Home" }, IN: {}, OUT: {} },
          { id: "old-child", L: "Attr", P: { key: "title" }, IN: {}, OUT: {} },
        ],
        edges: [
          { id: "old-e", T: "Attr", S: "old-root", E: "old-child", P: {} },
        ],
      },
      graph,
      setGraph,
    );

    expect(result.metaTxnId).toBeGreaterThan(0);
    expect(result.vertexIdMap.get("old-root")).toBeDefined();
    expect(result.vertexIdMap.get("old-child")).toBeDefined();
    expect(result.rootVertexIds).toHaveLength(1);

    const newRootId = result.vertexIdMap.get("old-root")!;
    const newChildId = result.vertexIdMap.get("old-child")!;
    expect(graph.vertexes[newRootId].P.key).toBe("Home");
    expect(graph.vertexes[newChildId].L).toContain("Attr");
    expect(Object.keys(graph.edges).length).toBeGreaterThan(0);
    warnSpy.mockRestore();
  });

  it("reuses existingNodeMap and skips creating mapped vertices", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({ newVertexId_: 1 });
    const existing = createVertex("db-page", ["Page"], { key: "Existing" });
    setGraph("vertexes", "db-page", existing);

    const map = new Map<string, string>([["old-page", "db-page"]]);
    const result = importGraphStructure(
      {
        vertexes: [{ id: "old-page", L: "Page", P: { key: "X" }, IN: {}, OUT: {} }],
        edges: [],
      },
      graph,
      setGraph,
      map,
    );

    expect(result.vertexIdMap.get("old-page")).toBe("db-page");
    expect(graph.vertexes["db-page"].P.key).toBe("Existing");
  });
});
