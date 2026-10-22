import { describe, expect, it, vi } from "vitest";
import { newEdge } from "./newEdge";

describe("newEdge", () => {
  it("builds an edge with endpoints and type", () => {
    expect(newEdge("e1", "Attr", { order: 1 }, "a", "b")).toEqual({
      id: "e1",
      T: "Attr",
      P: { order: 1 },
      S: "a",
      E: "b",
    });
  });

  it("logs when start or end is empty", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    newEdge("e2", "Attr", {}, "", "b");
    newEdge("e3", "Attr", {}, "a", "");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
