import { describe, expect, it } from "vitest";
import {
  findVertexByLabelAndPks,
  findVertexByLabelAndUniqueId,
  findVertexByLabelAndUniqueIdWithSkip,
  findVertexIdsByLabel,
} from "./findVertex";
import {
  createEmptyGraph,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("findVertex helpers", () => {
  it("finds by label + pks / unique id / skip / ids", () => {
    const { graph, setGraph } = createEmptyGraph();
    seedVertex(setGraph, createVertex("a", ["User"], { email: "a@x.com", role: "admin" }));
    seedVertex(setGraph, createVertex("b", ["User"], { email: "b@x.com", role: "user" }));

    expect(
      findVertexByLabelAndPks("User", { email: "b@x.com", role: "user" }, graph)
        ?.id,
    ).toBe("b");
    expect(findVertexByLabelAndPks("User", null as never, graph)).toBeUndefined();
    expect(findVertexByLabelAndUniqueId(graph, "User", "email", "a@x.com")?.id).toBe(
      "a",
    );
    expect(
      findVertexByLabelAndUniqueIdWithSkip("User", "role", "admin", "a", graph),
    ).toBeUndefined();
    expect(
      findVertexByLabelAndUniqueIdWithSkip("User", "role", "admin", "b", graph)
        ?.id,
    ).toBe("a");
    expect(findVertexIdsByLabel(graph, "User").sort()).toEqual(["a", "b"]);
    expect(findVertexIdsByLabel(graph, "Missing")).toEqual([]);
  });
});
