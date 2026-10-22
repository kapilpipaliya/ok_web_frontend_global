import { describe, expect, it, vi, beforeEach } from "vitest";
import { setParentValue } from "./setParentValue";
import {
  createGraphWithGlobalStore,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

vi.mock("~/lib/graph/mutate/core/channel/broadcastToAllChannels", () => ({
  broadcastToAllChannels: vi.fn(),
}));

vi.mock("~/components/styled/modal/Toast", () => ({
  useToast: () => ({
    showErrorToast: vi.fn(),
    showWarningToast: vi.fn(),
  }),
}));

describe("setParentValue", () => {
  beforeEach(() => vi.clearAllMocks());

  it("wires inward edges from parent ids to the vertex", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({
      newVertexId_: 20,
    });
    seedVertex(setGraph, createVertex("child", ["Attr"]));
    seedVertex(setGraph, createVertex("p1", ["Page"]));
    seedVertex(setGraph, createVertex("p2", ["Page"]));

    const meta = createVertex("meta", ["Meta"], {
      type: "PageAttr",
    });

    setParentValue(graph, setGraph, 0, graph.vertexes.child, meta, [
      "p1",
      "p2",
    ]);

    const starts = (graph.vertexes.child.IN.PageAttr || []).map(
      (id) => graph.edges[id].S,
    );
    expect(starts.sort()).toEqual(["p1", "p2"]);
  });
});
