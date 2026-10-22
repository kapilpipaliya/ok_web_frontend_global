import { describe, it, expect, vi, beforeEach } from "vitest";
import { undoTxn } from "./undoTxn";
import {
  createGraphWithGlobalStore,
  createEdge,
  createVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import { insertStep, mergeStep } from "../__tests__/fixtures";

describe("undoTxn", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("undo insert deletes the vertex", () => {
    const v = createVertex("v1", ["Page"], { title: "x" });
    const { graph, setGraph } = createGraphWithGlobalStore({
      extraVertexes: { v1: v },
    });

    undoTxn(insertStep(v), graph, setGraph);

    expect(graph.vertexes.v1).toBeUndefined();
  });

  it("undo merge restores original properties", () => {
    const original = createVertex("v1", ["Page"], { title: "before" });
    const current = createVertex("v1", ["Page"], { title: "after" });
    const { graph, setGraph } = createGraphWithGlobalStore({
      extraVertexes: { v1: current },
    });

    undoTxn(mergeStep("v1", current, original), graph, setGraph);

    expect(graph.vertexes.v1.P.title).toBe("before");
  });

  it("undo deleteEdge re-adds the edge", () => {
    const edge = createEdge("e1", "Link", "v1", "v2");
    const { graph, setGraph } = createGraphWithGlobalStore({
      extraVertexes: {
        v1: createVertex("v1", ["Page"], {}),
        v2: createVertex("v2", ["Page"], {}),
      },
    });

    undoTxn(
      {
        id: "e1",
        deleteEdge: "deleteEdge",
        data: edge,
        originalData: edge,
      },
      graph,
      setGraph,
    );

    expect(graph.edges.e1).toEqual(edge);
  });
});
