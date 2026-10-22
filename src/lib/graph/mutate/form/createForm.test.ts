import { describe, expect, it, vi } from "vitest";
import { createFormVertex } from "./createForm";
import { createGraphWithGlobalStore } from "~/lib/graph/__tests__/helpers/createTestGraph";

vi.mock("~/lib/graph/mutate/core/channel/broadcastToAllChannels", () => ({
  broadcastToAllChannels: vi.fn(),
}));

describe("createFormVertex", () => {
  it("requires a label", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    expect(createFormVertex(graph, setGraph, 0, "").error).toBe(
      "Label not found",
    );
  });

  it("creates a labeled vertex with generated id", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({
      newVertexId_: 10,
    });
    const result = createFormVertex(graph, setGraph, 0, "Page", {
      key: "Home",
    });
    expect(result.error).toBe("");
    expect(result.vertex?.L).toEqual(["Page"]);
    expect(result.vertex?.P.key).toBe("Home");
    expect(result.vertex?.id).toBe("11");
    expect(graph.vertexes["11"]).toBeDefined();
  });
});
