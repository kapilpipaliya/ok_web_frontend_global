import { describe, expect, it } from "vitest";
import { splitGraphByComponentKeys } from "./splitGraphByComponentKeys";
import {
  createEdge,
  createVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("splitGraphByComponentKeys", () => {
  it("returns empty for missing graph or keys", () => {
    expect(splitGraphByComponentKeys(undefined, ["A"]).size).toBe(0);
    expect(
      splitGraphByComponentKeys({ graph: { vertexes: {}, edges: {} } }, [])
        .size,
    ).toBe(0);
  });

  it("walks reachable edges from each Component root", () => {
    const result = {
      graph: {
        vertexes: {
          c1: createVertex("c1", ["Component"], { key: "Button" }),
          a1: createVertex("a1", ["Attr"], { componentName: "Html" }),
          a2: createVertex("a2", ["Attr"], { componentName: "Html" }),
          c2: createVertex("c2", ["Component"], { key: "Card" }),
          orphan: createVertex("orphan", ["Attr"], {}),
        },
        edges: {
          e1: createEdge("e1", "Attr", "c1", "a1"),
          e2: createEdge("e2", "Attr", "a1", "a2"),
          e3: createEdge("e3", "Attr", "c2", "orphan"),
        },
      },
    };

    const map = splitGraphByComponentKeys(result, ["Button", "Card", "Missing"]);
    expect([...map.keys()].sort()).toEqual(["Button", "Card"]);
    expect(Object.keys(map.get("Button")!.graph!.vertexes).sort()).toEqual([
      "a1",
      "a2",
      "c1",
    ]);
    expect(Object.keys(map.get("Button")!.graph!.edges).sort()).toEqual([
      "e1",
      "e2",
    ]);
    expect(Object.keys(map.get("Card")!.graph!.vertexes).sort()).toEqual([
      "c2",
      "orphan",
    ]);
  });
});
