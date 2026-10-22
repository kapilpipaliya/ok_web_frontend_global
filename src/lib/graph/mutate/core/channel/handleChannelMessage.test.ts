import { describe, expect, it, vi, beforeEach } from "vitest";
import { handleChannelMessage } from "./handleChannelMessage";
import {
  createGraphWithGlobalStore,
  createVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import { newEdge } from "~/lib/graph/mutate/core/edge/newEdge";
import { newVertex } from "~/lib/graph/mutate/core/vertex/newVertex";

vi.mock("~/lib/graph/mutate/core/channel/broadcastToAllChannels", () => ({
  broadcastToAllChannels: vi.fn(),
}));

describe("handleChannelMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("alert", vi.fn());
  });

  it("applies graph reconcile and addChannelId", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({
      broadcastChannels: [],
    });
    handleChannelMessage(
      JSON.stringify({
        graph: {
          broadcastChannels: [],
          edges: {},
          vertexes: {
            ...graph.vertexes,
            x: createVertex("x", ["Page"], { key: "Home" }),
          },
          vertexLabelIdMap: { Page: ["x"] },
        },
      }),
      graph,
      setGraph,
      "channel-1",
      "channel-2",
      true,
    );
    expect(graph.vertexes.x?.P.key).toBe("Home");
    expect(graph.broadcastChannels).toContain("channel-2");
  });

  it("handles addNewVertex / addNewEdge messages", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    handleChannelMessage(
      JSON.stringify({
        addNewVertex: {
          txnId: 0,
          vertex: newVertex("v1", ["Attr"], { key: "t" }),
        },
      }),
      graph,
      setGraph,
      "ch",
      undefined,
      true,
    );
    expect(graph.vertexes.v1.P.key).toBe("t");

    handleChannelMessage(
      JSON.stringify({
        addNewVertex: {
          txnId: 0,
          vertex: newVertex("v2", ["Attr"], {}),
        },
      }),
      graph,
      setGraph,
      "ch",
      undefined,
      true,
    );
    handleChannelMessage(
      JSON.stringify({
        addNewEdge: {
          txnId: 0,
          edge: newEdge("e1", "Attr", {}, "v1", "v2"),
        },
      }),
      graph,
      setGraph,
      "ch",
      undefined,
      true,
    );
    expect(graph.edges.e1.T).toBe("Attr");
  });
});
