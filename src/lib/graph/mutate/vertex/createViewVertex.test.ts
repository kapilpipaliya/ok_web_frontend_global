import { describe, it, expect } from "vitest";
import { createViewVertex } from "~/lib/graph/mutate/vertex/createViewVertex";
import { createGraphWithGlobalStore } from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("createViewVertex", () => {
  it("adds a View vertex with given props", () => {
    const { graph, setGraph } = createGraphWithGlobalStore();
    const vertex = createViewVertex({ foo: "bar" }, graph, setGraph);
    expect(vertex.L).toEqual(["View"]);
    expect(vertex.P).toEqual({ foo: "bar" });
    expect(vertex.id.endsWith("-view")).toBe(true);
    expect(graph.vertexes[vertex.id]).toBeDefined();
    expect(graph.vertexLabelIdMap.View).toContain(vertex.id);
  });
});
