import { describe, it, expect, vi } from "vitest";
import { getPropsFromMetaExpression } from "~/lib/graph/get/sync/expression/getPropsFromMetaExpression";
import {
  createEmptyGraph,
  createVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import * as expressionEval from "~/lib/expression_eval";

describe("getPropsFromMetaExpression", () => {
  it("returns empty object when meta expression is missing", () => {
    const { graph, setGraph } = createEmptyGraph();
    const meta = createVertex("m", ["Meta"], {});
    expect(getPropsFromMetaExpression(graph, setGraph, meta, createVertex("d", [], {}))).toEqual(
      {},
    );
  });

  it("builds props map from meta row vertices", () => {
    const { graph, setGraph } = createEmptyGraph();
    const meta = createVertex("m", ["Meta"], { meta: "->$0Props" });
    const data = createVertex("d", ["Row"], {});
    const row1 = createVertex("r1", ["Prop"], { key: "title", value: "Hello" });
    const row2 = createVertex("r2", ["Prop"], { key: "count", value: 3 });

    vi.spyOn(expressionEval, "evalExpression").mockImplementation((expr, ctx) => {
      if (expr === "->$0Props") {
        return [row1, row2];
      }
      if (typeof expr === "string" && expr.includes("Name")) {
        const row = ctx?.vertexes?.[0];
        return row?.P?.key ? [row.P.key] : [];
      }
      return [];
    });

    const props = getPropsFromMetaExpression(graph, setGraph, meta, data);
    expect(props.title).toBe("Hello");
    expect(props.count).toBe(3);
  });
});
