import { describe, it, expect, vi, beforeEach } from "vitest";
import { getNameKeyForCollection } from "~/lib/graph/get/sync/entity/getNameKeyForCollection";
import { createEmptyGraph, createVertex } from "~/lib/graph/__tests__/helpers/createTestGraph";
import * as expressionEval from "~/lib/expression_eval";

describe("getNameKeyForCollection", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("maps NameKey vertices to key strings", () => {
    const { graph } = createEmptyGraph();
    const coll = createVertex("coll1", ["Collection"], { key: "User" });
    vi.spyOn(expressionEval, "evalExpression").mockReturnValue([
      createVertex("nk1", ["NameKey"], { key: "displayName" }),
    ]);

    expect(getNameKeyForCollection(graph, coll)).toEqual(["displayName"]);
    expect(expressionEval.evalExpression).toHaveBeenCalledWith("->$0NameKey", {
      graph,
      vertexes: [coll],
    });
  });
});
