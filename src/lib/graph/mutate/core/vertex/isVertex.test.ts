import { describe, expect, it } from "vitest";
import { isVertex } from "./isVertex";

describe("isVertex", () => {
  it("accepts valid vertex shape", () => {
    expect(isVertex({ id: "1", L: ["A"], P: {} })).toBe(true);
  });

  it("rejects non-objects and incomplete shapes", () => {
    expect(isVertex(null)).toBe(false);
    expect(isVertex(undefined)).toBe(false);
    expect(isVertex("x")).toBe(false);
    expect(isVertex({ id: 1, L: [], P: {} })).toBe(false);
    expect(isVertex({ id: "1", L: "A", P: {} })).toBe(false);
    expect(isVertex({ id: "1", L: [], P: null })).toBe(false);
  });
});
