import { describe, it, expect } from "vitest";
import { getCompanyFaviconVertex } from "~/lib/graph/get/sync/company/getCompanyFaviconVertex";
import {
  createEmptyGraph,
  createVertex,
  createEdge,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";
import { addNewEdge } from "~/lib/graph/mutate/core/edge/addNewEdge";

describe("getCompanyFaviconVertex", () => {
  it("returns favicon file vertex", () => {
    const { graph, setGraph } = createEmptyGraph();
    seedVertex(setGraph, createVertex("gs1", ["GlobalSetting"], {}));
    const file = createVertex("f1", ["File"], { fileName: "fav.ico" });
    seedVertex(setGraph, file);
    addNewEdge(
      0,
      createEdge("e1", "CompanyFavicon", "gs1", "f1"),
      graph,
      setGraph,
    );
    expect(getCompanyFaviconVertex(graph)?.id).toBe("f1");
  });
});
