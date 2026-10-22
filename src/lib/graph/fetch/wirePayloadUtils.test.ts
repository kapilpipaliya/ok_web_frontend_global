import { describe, expect, it } from "vitest";
import {
  extractRootIdFromResult,
  prepareServerResultForWire,
  stripResultFromServerResult,
  toComponentGraphData,
} from "./wirePayloadUtils";
import { createVertex } from "~/lib/graph/__tests__/helpers/createTestGraph";

describe("wirePayloadUtils", () => {
  it("extractRootIdFromResult handles array/object/empty", () => {
    expect(extractRootIdFromResult(undefined)).toBeUndefined();
    expect(extractRootIdFromResult({ result: [] })).toBeUndefined();
    expect(
      extractRootIdFromResult({ result: [{ id: "root1" }] as never }),
    ).toBe("root1");
    expect(
      extractRootIdFromResult({ result: { id: "root2" } as never }),
    ).toBe("root2");
  });

  it("stripResultFromServerResult deletes result", () => {
    const sr = { result: { id: "x" }, graph: { vertexes: {}, edges: {} } };
    stripResultFromServerResult(sr);
    expect(sr.result).toBeUndefined();
  });

  it("prepareServerResultForWire and toComponentGraphData", () => {
    const serverResult = {
      result: { id: "r" },
      graph: {
        vertexes: {
          a: createVertex(
            "a",
            ["Attr"],
            { layerName: "L" },
            { OUT: { X: ["1"] } },
          ),
        },
        edges: {},
      },
    };
    prepareServerResultForWire(serverResult);
    expect(serverResult.result).toBeUndefined();
    expect(serverResult.graph.vertexes.a.OUT).toBeUndefined();

    const data = toComponentGraphData({
      graph: {
        vertexes: { b: createVertex("b", ["Component"], { key: "Btn" }) },
        edges: {},
      },
    });
    expect(data?.graph?.vertexes.b.P.key).toBe("Btn");
    expect(toComponentGraphData(undefined)).toBeUndefined();
  });
});
