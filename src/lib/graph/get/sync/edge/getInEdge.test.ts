import { describe, expect, it } from "vitest";
import { getInEdge } from "./getInEdge";
import { createVertex } from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("getInEdge", () => {
  it("prefers meta.P.type", () => {
    const meta = createVertex("m", ["Meta"], { type: "CustomEdge" });
    const vertex = createVertex("v", ["Child"]);
    expect(getInEdge(meta, vertex)).toBe("CustomEdge");
  });

  it("builds ParentChild from labels", () => {
    const meta = createVertex("m", ["Meta"], {
      parentLabel: "page",
      childLabel: "attr",
    });
    expect(getInEdge(meta, createVertex("v", ["X"]))).toBe("PageAttr");
  });

  it("falls back to vertex label and empty parent", () => {
    const meta = createVertex("m", ["Meta"], { parentLabel: "page" });
    expect(getInEdge(meta, createVertex("v", ["Attr"]))).toBe("PageAttr");
    expect(getInEdge(createVertex("m", ["Meta"], {}), createVertex("v", ["A"]))).toBe(
      "",
    );
  });
});
