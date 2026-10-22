import { describe, it, expect } from "vitest";
import { createCompContextVertex } from "~/lib/graph/mutate/vertex/createCompContextVertex";
import { createGraphWithGlobalStore } from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("createCompContextVertex", () => {
  it("adds a ComponentValue vertex with given props", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    const vertex = createCompContextVertex({ value: 1 }, graph, setGraph);
    expect(vertex.L).toEqual(["ComponentValue"]);
    expect(vertex.P).toEqual({ value: 1 });
    expect(vertex.id.endsWith("-comp-value")).toBe(true);
    expect(graph.vertexes[vertex.id]).toBeDefined();
    expect(graph.vertexLabelIdMap.ComponentValue).toContain(vertex.id);
  });
});
