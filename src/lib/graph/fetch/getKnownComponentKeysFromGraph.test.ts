import { describe, expect, it } from "vitest";
import { getKnownComponentKeysFromGraph } from "./getKnownComponentKeysFromGraph";
import {
  createEmptyGraph,
  createVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("getKnownComponentKeysFromGraph", () => {
  it("returns sorted unique Component keys", () => {
    const { graph, setGraph } = createEmptyGraph({
      vertexes: {
        c1: createVertex("c1", ["Component"], { key: "Button" }),
        c2: createVertex("c2", ["Component"], { key: "Card" }),
        c3: createVertex("c3", ["Component"], { key: "Button" }),
        other: createVertex("other", ["Page"], { key: "Home" }),
        empty: createVertex("empty", ["Component"], { key: "" }),
      },
    });
    void setGraph;
    expect(getKnownComponentKeysFromGraph(graph)).toEqual(["Button", "Card"]);
  });
});
