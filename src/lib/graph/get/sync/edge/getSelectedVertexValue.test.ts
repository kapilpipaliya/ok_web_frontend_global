import { describe, it, expect } from "vitest";
import { getSelectedVertexValue } from "~/lib/graph/get/sync/edge/getSelectedVertexValue";
import {
  createEmptyGraph,
  createVertex,
  createEdge,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("getSelectedVertexValue", () => {
  it("returns end vertex ids for outgoing edges of computed type", () => {
    const { graph, setGraph } = createEmptyGraph();
    const row = createVertex("row", ["Order"], {});
    row.OUT = { OrderCustomer: ["e1"] };
    seedVertex(setGraph, createVertex("cust", ["Customer"], {}));
    setGraph((d) => {
      d.edges.e1 = createEdge("e1", "OrderCustomer", "row", "cust");
    });
    const meta = createVertex("m", ["Meta"], { key: "customer" });

    expect(getSelectedVertexValue(graph, row, meta)).toEqual(["cust"]);
  });

  it("returns empty array when vertex has no label", () => {
    const { graph } = createEmptyGraph();
    expect(
      getSelectedVertexValue(graph, { id: "x", L: undefined as any, P: {}, IN: {}, OUT: {} }, createVertex("m", [], { key: "a" })),
    ).toEqual([]);
  });
});
