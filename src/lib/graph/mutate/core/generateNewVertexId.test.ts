import { describe, expect, it, vi } from "vitest";
import { generateNewVertexId } from "./generateNewVertexId";
import { createGraphWithGlobalStore } from "~/lib/graph/__tests__/helpers/createTestGraph";

vi.mock("~/lib/graph/mutate/core/channel/broadcastToAllChannels", () => ({
  broadcastToAllChannels: vi.fn(),
}));

describe("generateNewVertexId", () => {
  it("increments globalStore newVertexId_", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({
      newVertexId_: 5,
    });
    expect(generateNewVertexId(graph, setGraph)).toBe("6");
    expect(graph.vertexes.globalStoreId.P.newVertexId_).toBe(6);
  });
});
