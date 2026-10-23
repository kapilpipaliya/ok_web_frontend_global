import { describe, it, expect, vi } from "vitest";
import { selectedValue } from "~/lib/graph/get/sync/edge/selectedValue";
import { createEmptyGraph, createVertex } from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("selectedValue", () => {
  it("reads static option values from data properties", () => {
    const { graph } = createEmptyGraph();
    const meta = createVertex("m", ["Meta"], { key: "status", options: ["a", "b"] });
    const data = createVertex("d", ["Row"], { status: "a" });
    expect(selectedValue(meta, data, graph)).toEqual(["a"]);
  });

  it("delegates to getSelectedVertexValue for outward relations", () => {
    const { graph, setGraph } = createEmptyGraph();
    const data = createVertex("d", ["Order"], {});
    data.OUT = { OrderCustomer: ["e1"] };
    setGraph((d) => {
      d.vertexes.d = data;
      d.vertexes.c = createVertex("c", ["Customer"], {});
      d.edges.e1 = {
        id: "e1",
        T: "OrderCustomer",
        S: "d",
        E: "c",
        P: {},
      };
    });
    const meta = createVertex("m", ["Meta"], { key: "customer", inward: false });
    expect(selectedValue(meta, data, graph)).toEqual(["c"]);
  });

  it("returns empty array on errors", () => {
    const { graph } = createEmptyGraph();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const meta = createVertex("m", ["Meta"], { key: "x", inward: false });
    const data = createVertex("d", ["Row"], { IN: {}, OUT: {} });
    expect(selectedValue(meta, data, graph)).toEqual([]);
    errorSpy.mockRestore();
  });
});
