import { describe, expect, it, vi } from "vitest";
import { produceGraph } from "./produceGraph";
import { addNewVertex } from "./vertex/addNewVertex";
import { addNewEdge } from "./edge/addNewEdge";
import { mergeVertexProperties } from "./vertex/mergeVertexProperties";
import { setGraphData } from "./setGraphData";
import { newVertex } from "./vertex/newVertex";
import { newEdge } from "./edge/newEdge";
import {
  createGraphWithGlobalStore,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import { getLastTxnIndex } from "~/lib/graph/transaction/value/getLastTxnIndex";
import { createTxnVertex } from "~/lib/graph/__tests__/helpers/createTestGraph";

vi.mock("~/lib/graph/mutate/core/channel/broadcastToAllChannels", () => ({
  broadcastToAllChannels: vi.fn(),
}));

describe("produceGraph draft-first prototype", () => {
  it("exposes writes synchronously on Solid 1 (read-after-write)", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    produceGraph(setGraph, (d) => {
      d.vertexes.demo = createVertex("demo", ["Page"], { key: "Home" });
    });
    // Solid 1: store reads see updates immediately after produce.
    // Solid 2: may require flush() before this assert passes.
    expect(graph.vertexes.demo.P.key).toBe("Home");
  });

  it("addNewVertex + mergeVertexProperties via draft writes", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({
      extraVertexes: { txn1: createTxnVertex(1) },
    });

    const added = addNewVertex(
      1,
      newVertex("v1", ["Attr"], { a: 1 }),
      graph,
      setGraph,
      { skipTransactionDetail: true },
    );
    expect(added.error).toBe("");
    expect(graph.vertexes.v1.P).toEqual({ a: 1 });

    mergeVertexProperties(
      1,
      "v1",
      graph,
      setGraph,
      { b: 2 },
      { skipTransactionDetail: true },
    );
    expect(graph.vertexes.v1.P).toEqual({ a: 1, b: 2 });
  });

  it("addNewEdge wires adjacency and sync txn index read", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({
      extraVertexes: { txn1: createTxnVertex(1) },
    });
    seedVertex(setGraph, createVertex("a", ["Page"]));
    seedVertex(setGraph, createVertex("b", ["Attr"]));

    const result = addNewEdge(
      1,
      newEdge("e1", "Attr", {}, "a", "b"),
      graph,
      setGraph,
      { skipTransactionDetail: true },
    );

    expect(result.error).toBe(false);
    expect(graph.edges.e1).toBeDefined();
    expect(graph.vertexes.a.OUT.Attr).toEqual(["e1"]);
    // Immediate read of txn index after mutate (Solid 2 flush risk).
    expect(getLastTxnIndex(1, graph)).toBe(-1);
  });

  it("setGraphData draft path restores adjacency", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    setGraphData(
      graph,
      setGraph,
      {
        vertexes: {
          p: createVertex("p", ["Page"], { key: "Home" }),
          c: createVertex("c", ["Attr"], { key: "title" }),
        },
        edges: {
          e1: newEdge("e1", "Attr", {}, "p", "c"),
        },
      },
      { skipTransactionDetail: true },
    );

    expect(graph.vertexes.p.OUT.Attr).toEqual(["e1"]);
    expect(graph.vertexes.c.IN.Attr).toEqual(["e1"]);
  });
});
