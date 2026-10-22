import { describe, it, expect } from "vitest";
import { getCompanyRectangularLogoVertex } from "~/lib/graph/get/sync/company/getCompanyRectangularLogoVertex";
import {
  createEmptyGraph,
  createVertex,
  createEdge,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";

function graphWithCompanyLogo(edgeType: string) {
  const { graph, setGraph } = createEmptyGraph();
  const gs = createVertex("gs1", ["GlobalSetting"], {});
  const file = createVertex("f1", ["File"], { fileName: "rect.png" });
  seedVertex(setGraph, gs);
  seedVertex(setGraph, file);
  addNewEdge(0, createEdge("e1", edgeType, "gs1", "f1"), graph, setGraph);
  return { graph, file };
}

describe("getCompanyRectangularLogoVertex", () => {
  it("returns file vertex linked from global setting", () => {
    const { graph, file } = graphWithCompanyLogo("CompanyRectangularLogo");
    expect(getCompanyRectangularLogoVertex(graph)?.id).toBe(file.id);
  });
});
