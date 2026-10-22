import { describe, expect, it } from "vitest";
import { getToEdge } from "./getToEdge";
import { createVertex } from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("getToEdge", () => {
  it("prefers meta.P.type", () => {
    expect(
      getToEdge(
        createVertex("m", ["Meta"], { type: "Link" }),
        createVertex("v", ["Page"]),
      ),
    ).toBe("Link");
  });

  it("builds Label + key", () => {
    expect(
      getToEdge(
        createVertex("m", ["Meta"], { key: "title" }),
        createVertex("v", ["page"]),
      ),
    ).toBe("PageTitle");
  });
});
