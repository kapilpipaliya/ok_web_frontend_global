import { describe, it, expect } from "vitest";
import { getCompanyRectangularLogoUrl } from "~/lib/graph/get/sync/company/getCompanyRectangularLogoUrl";
import {
  createEmptyGraph,
  createVertex,
  createEdge,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";
import { rectangleLogoImage } from "~/pages/settings/constants";
import { API } from "~/lib/api/endpoints";

describe("getCompanyRectangularLogoUrl", () => {
  it("returns download url when logo file exists", () => {
    const { graph, setGraph } = createEmptyGraph();
    seedVertex(setGraph, createVertex("gs1", ["GlobalSetting"], {}));
    seedVertex(setGraph, createVertex("f1", ["File"], { fileName: "logo.png" }));
    addNewEdge(
      0,
      createEdge("e1", "CompanyRectangularLogo", "gs1", "f1"),
      graph,
      setGraph,
    );
    expect(getCompanyRectangularLogoUrl(graph)).toBe(
      `${API.file.downloadFileUrl}/logo.png`,
    );
  });

  it("falls back to default rectangle image", () => {
    const { graph } = createEmptyGraph();
    expect(getCompanyRectangularLogoUrl(graph)).toBe(rectangleLogoImage);
  });
});
