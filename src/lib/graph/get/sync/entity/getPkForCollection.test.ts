import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPkForCollection } from "~/lib/graph/get/sync/entity/getPkForCollection";
import { createEmptyGraph, createVertex } from "~/lib/graph/__tests__/helpers/createTestGraph";
import * as expressionEval from "~/lib/expression_eval";

describe("getPkForCollection", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("maps Pk vertices to key strings from evalExpression result", () => {
    const { graph } = createEmptyGraph();
    const coll = createVertex("coll1", ["Collection"], { key: "User" });
    vi.spyOn(expressionEval, "evalExpression").mockReturnValue([
      createVertex("pk1", ["Pk"], { key: "uuid" }),
      createVertex("pk2", ["Pk"], { key: "email" }),
    ]);

    expect(getPkForCollection(graph, coll)).toEqual(["uuid", "email"]);
    expect(expressionEval.evalExpression).toHaveBeenCalledWith("->$0Pk", {
      graph,
      vertexes: [coll],
    });
  });

  it("returns empty array when expression yields nothing", () => {
    const { graph } = createEmptyGraph();
    vi.spyOn(expressionEval, "evalExpression").mockReturnValue(undefined);
    expect(getPkForCollection(graph, createVertex("c", ["Collection"], {}))).toEqual(
      [],
    );
  });
});
