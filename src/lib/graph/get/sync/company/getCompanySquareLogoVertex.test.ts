import { describe, it, expect } from "vitest";
import { getCompanySquareLogoVertex } from "~/lib/graph/get/sync/company/getCompanySquareLogoVertex";
import {
  createEmptyGraph,
  createVertex,
  createEdge,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";

describe("getCompanySquareLogoVertex", () => {
  it("returns square logo file vertex", () => {
    const { graph, setGraph } = createEmptyGraph();
    seedVertex(setGraph, createVertex("gs1", ["GlobalSetting"], {}));
    const file = createVertex("f1", ["File"], { fileName: "sq.png" });
    seedVertex(setGraph, file);
    addNewEdge(
      0,
      createEdge("e1", "CompanySquareLogo", "gs1", "f1"),
      graph,
      setGraph,
    );
    expect(getCompanySquareLogoVertex(graph)?.id).toBe("f1");
  });
});
