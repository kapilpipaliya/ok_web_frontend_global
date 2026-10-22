import { describe, expect, it } from "vitest";
import { sortVertexesByPosition } from "./sortVertexesByPosition";
import { createVertex } from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("sortVertexesByPosition", () => {
  it("sorts by displayOrder ascending in place", () => {
    const a = createVertex("a", ["Attr"], { displayOrder: 3 });
    const b = createVertex("b", ["Attr"], { displayOrder: 1 });
    const c = createVertex("c", ["Attr"], { displayOrder: 2 });
    const sorted = sortVertexesByPosition([a, b, c]);
    expect(sorted.map((v) => v.id)).toEqual(["b", "c", "a"]);
    expect(sorted).toBeInstanceOf(Array);
  });
});
