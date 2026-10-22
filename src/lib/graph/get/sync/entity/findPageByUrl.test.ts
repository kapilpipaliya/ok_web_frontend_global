import { describe, expect, it } from "vitest";
import { findPageMatchByUrl, matchUrlPattern } from "./findPageByUrl";
import {
  createEmptyGraph,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("matchUrlPattern", () => {
  it("matches static paths", () => {
    expect(matchUrlPattern("/about", "/about")).toEqual({});
    expect(matchUrlPattern("/about", "/other")).toBeNull();
  });

  it("extracts dynamic segments and optional trailing segments", () => {
    expect(matchUrlPattern("/users/:id", "/users/42")).toEqual({ id: "42" });
    expect(matchUrlPattern("/gallery/:category?", "/gallery")).toEqual({});
    expect(matchUrlPattern("/gallery/:category?", "/gallery/animals")).toEqual({
      category: "animals",
    });
    expect(matchUrlPattern("/a/:b", "/a")).toBeNull();
    expect(matchUrlPattern("/a/:b", "/a/b/c")).toBeNull();
  });

  it("decodes URI components when possible", () => {
    expect(matchUrlPattern("/p/:name", "/p/hello%20world")).toEqual({
      name: "hello world",
    });
  });
});

describe("findPageMatchByUrl", () => {
  it("prefers exact url match over dynamic", () => {
    const { graph, setGraph } = createEmptyGraph();
    seedVertex(
      setGraph,
      createVertex("exact", ["Page"], { url: "/users/john" }),
    );
    seedVertex(
      setGraph,
      createVertex("dyn", ["Page"], { url: "/users/:id" }),
    );

    const match = findPageMatchByUrl(graph, "/users/john");
    expect(match?.vertex.id).toBe("exact");
    expect(match?.isDynamic).toBe(false);
  });

  it("picks the most specific dynamic pattern", () => {
    const { graph, setGraph } = createEmptyGraph();
    seedVertex(
      setGraph,
      createVertex("broad", ["Page"], { url: "/shop/:a/:b" }),
    );
    seedVertex(
      setGraph,
      createVertex("narrow", ["Page"], { url: "/shop/:slug" }),
    );

    const match = findPageMatchByUrl(graph, "/shop/shoes");
    expect(match?.vertex.id).toBe("narrow");
    expect(match?.params).toEqual({ slug: "shoes" });
    expect(match?.isDynamic).toBe(true);
  });

  it("returns undefined for empty path", () => {
    const { graph } = createEmptyGraph();
    expect(findPageMatchByUrl(graph, "")).toBeUndefined();
  });
});
