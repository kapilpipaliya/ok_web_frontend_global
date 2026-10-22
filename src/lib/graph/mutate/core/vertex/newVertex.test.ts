import { describe, expect, it } from "vitest";
import { newVertex } from "./newVertex";

describe("newVertex", () => {
  it("creates a vertex with empty adjacency and given labels/props", () => {
    const v = newVertex("v1", ["Attr", "Page"], { key: "Home" });
    expect(v).toEqual({
      id: "v1",
      L: ["Attr", "Page"],
      P: { key: "Home" },
      IN: {},
      OUT: {},
    });
  });

  it("defaults properties to empty object", () => {
    expect(newVertex("v2", ["X"]).P).toEqual({});
  });
});
