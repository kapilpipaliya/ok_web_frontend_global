import { describe, it, expect } from "vitest";
import { getCompanySquareLogoUrl } from "~/lib/graph/get/sync/company/getCompanySquareLogoUrl";
import {
  createEmptyGraph,
  createVertex,
  createEdge,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";
import { squareLogoImage } from "~/pages/settings/constants";
import { API } from "~/lib/api/endpoints";

describe("getCompanySquareLogoUrl", () => {
  it("returns download url when square logo exists", () => {
    const { graph, setGraph } = createEmptyGraph();
    seedVertex(setGraph, createVertex("gs1", ["GlobalSetting"], {}));
    seedVertex(setGraph, createVertex("f1", ["File"], { fileName: "sq.png" }));
    addNewEdge(
      0,
      createEdge("e1", "CompanySquareLogo", "gs1", "f1"),
      graph,
      setGraph,
    );
    expect(getCompanySquareLogoUrl(graph)).toBe(
      `${API.file.downloadFileUrl}/sq.png`,
    );
  });

  it("falls back to default square image", () => {
    const { graph } = createEmptyGraph();
    expect(getCompanySquareLogoUrl(graph)).toBe(squareLogoImage);
  });
});
