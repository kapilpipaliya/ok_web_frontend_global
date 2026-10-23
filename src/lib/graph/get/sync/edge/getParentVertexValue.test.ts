import { describe, it, expect } from "vitest";
import { getParentVertexValue } from "~/lib/graph/get/sync/edge/getParentVertexValue";
import {
  createEmptyGraph,
  createVertex,
  createEdge,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("getParentVertexValue", () => {
  it("returns start vertex ids for incoming edges of computed type", () => {
    const { graph, setGraph } = createEmptyGraph();
    const child = createVertex("child", ["LineItem"], {});
    child.IN = { OrderLineItem: ["e1"] };
    const parent = createVertex("parent", ["Order"], {});
    setGraph((d) => {
      d.vertexes.child = child;
      d.vertexes.parent = parent;
      d.edges.e1 = createEdge("e1", "OrderLineItem", "parent", "child");
    });
    const meta = createVertex("m", ["Meta"], {
      parentLabel: "order",
      childLabel: "lineItem",
    });

    expect(getParentVertexValue(graph, child, meta)).toEqual(["parent"]);
  });

  it("returns empty array when in-edge type cannot be resolved", () => {
    const { graph } = createEmptyGraph();
    const child = createVertex("child", ["LineItem"], { IN: {} });
    const meta = createVertex("m", ["Meta"], {});
    expect(getParentVertexValue(graph, child, meta)).toEqual([]);
  });
});
