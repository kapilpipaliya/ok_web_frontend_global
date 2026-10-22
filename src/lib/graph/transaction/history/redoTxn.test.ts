import { describe, it, expect, vi, beforeEach } from "vitest";
import { redoTxn } from "./redoTxn";
import {
  createGraphWithGlobalStore,
  createEdge,
  createVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import { insertStep, mergeStep } from "../__tests__/fixtures";

describe("redoTxn", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("redo insert adds the vertex", () => {
    const v = createVertex("v1", ["Page"], { title: "x" });
    const { graph, setGraph } = createGraphWithGlobalStore();

    redoTxn(insertStep(v), graph, setGraph);

    expect(graph.vertexes.v1.P.title).toBe("x");
  });

  it("redo merge applies merged properties", () => {
    const original = createVertex("v1", ["Page"], { title: "before" });
    const merged = createVertex("v1", ["Page"], { title: "after" });
    const { graph, setGraph } = createGraphWithGlobalStore({
      extraVertexes: { v1: original },
    });

    redoTxn(mergeStep("v1", merged, original), graph, setGraph);

    expect(graph.vertexes.v1.P.title).toBe("after");
  });

  it("redo deleteVertex removes the vertex", () => {
    const v = createVertex("v1", ["Page"], {});
    const { graph, setGraph } = createGraphWithGlobalStore({
      extraVertexes: { v1: v },
    });

    redoTxn(
      {
        id: "v1",
        deleteVertex: "deleteVertex",
        data: v,
        originalData: v,
      },
      graph,
      setGraph,
    );

    expect(graph.vertexes.v1).toBeUndefined();
  });

  it("redo insertEdge adds the edge", () => {
    const edge = createEdge("e1", "Link", "v1", "v2");
    const { graph, setGraph } = createGraphWithGlobalStore({
      extraVertexes: {
        v1: createVertex("v1", ["Page"], {}),
        v2: createVertex("v2", ["Page"], {}),
      },
    });

    redoTxn(
      {
        id: "e1",
        insertEdge: "insertEdge",
        data: edge,
        originalData: edge,
      },
      graph,
      setGraph,
    );

    expect(graph.edges.e1).toEqual(edge);
  });
});
