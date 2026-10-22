import { describe, it, expect, vi, afterEach } from "vitest";
import { getEdgesFromGraph } from "~/lib/graph/get/sync/edge/getEdgesFromGraph";
import {
  createEmptyGraph,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import * as getChildrenAttrsModule from "~/features/page_designer/functions/layout/getChildrenAttrs";

describe("getEdgesFromGraph", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty arrays for missing vertex", () => {
    const { graph } = createEmptyGraph();
    expect(getEdgesFromGraph(graph, "missing")).toEqual({
      incoming: [],
      outgoing: [],
    });
  });

  it("collects select edges from root and nested attrs", () => {
    const { graph, setGraph } = createEmptyGraph();
    const root = createVertex("root", ["Attr"], {
      componentName: "Select",
      key: "owner",
      inward: false,
    });
    const child = createVertex("child", ["Attr"], {
      componentName: "MultiSelect",
      parentLabel: "user",
      childLabel: "role",
      inward: true,
    });
    seedVertex(setGraph, root);
    vi.spyOn(getChildrenAttrsModule, "getChildrenAttrs").mockImplementation(
      (_g, _s, vertex) => (vertex.id === "root" ? [child] : []),
    );

    const result = getEdgesFromGraph(graph, "root");
    expect(result.outgoing).toEqual([{ expression: "->$0Owner" }]);
    expect(result.incoming).toEqual([{ expression: "<-UserRole" }]);
  });

  it("skips hideInGrid when ignoreTables is true", () => {
    const { graph, setGraph } = createEmptyGraph();
    seedVertex(
      setGraph,
      createVertex("root", ["Attr"], {
        componentName: "Select",
        key: "x",
        hideInGrid: true,
        inward: false,
      }),
    );
    vi.spyOn(getChildrenAttrsModule, "getChildrenAttrs").mockReturnValue([]);
    expect(getEdgesFromGraph(graph, "root", true)).toEqual({
      incoming: [],
      outgoing: [],
    });
  });
});
