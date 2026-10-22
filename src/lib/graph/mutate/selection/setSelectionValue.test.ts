import { describe, expect, it, vi, beforeEach } from "vitest";
import { setSelectionValue } from "./setSelectionValue";
import { newEdge } from "~/lib/graph/mutate/core/edge/newEdge";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";
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

describe("setSelectionValue", () => {
  beforeEach(() => vi.clearAllMocks());

  it("adds outward edges for selected ids and removes others", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({
      newVertexId_: 10,
    });
    seedVertex(setGraph, createVertex("owner", ["Page"]));
    seedVertex(setGraph, createVertex("opt1", ["Option"]));
    seedVertex(setGraph, createVertex("opt2", ["Option"]));
    seedVertex(setGraph, createVertex("opt3", ["Option"]));

    const meta = createVertex("meta", ["Meta"], { key: "options" });

    addNewEdge(
      0,
      newEdge("e-old", "PageOptions", {}, "owner", "opt1"),
      graph,
      setGraph,
      { skipTransactionDetail: true },
    );

    setSelectionValue(0, graph.vertexes.owner, graph, setGraph, meta, [
      "opt2",
      "opt3",
    ]);

    const type = "PageOptions";
    const ends = (graph.vertexes.owner.OUT[type] || []).map(
      (id) => graph.edges[id].E,
    );
    expect(ends.sort()).toEqual(["opt2", "opt3"]);
    expect(graph.edges["e-old"]).toBeUndefined();
  });
});
