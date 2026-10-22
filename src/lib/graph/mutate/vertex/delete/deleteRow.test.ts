import { describe, expect, it, vi, beforeEach } from "vitest";
import { deleteRow } from "./deleteRow";
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

describe("deleteRow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("alert", vi.fn());
  });

  it("deletes incident edges then the vertex", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    seedVertex(setGraph, createVertex("parent", ["Page"]));
    seedVertex(setGraph, createVertex("row", ["Attr"]));
    addNewEdge(
      0,
      newEdge("e1", "Attr", {}, "parent", "row"),
      graph,
      setGraph,
      { skipTransactionDetail: true },
    );

    deleteRow(graph.vertexes.row, false, graph, setGraph, 0);

    expect(graph.edges.e1).toBeUndefined();
    expect(graph.vertexes.row).toBeUndefined();
    expect(graph.vertexes.parent.OUT.Attr).toBeUndefined();
  });
});
