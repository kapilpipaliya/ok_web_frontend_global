import { describe, expect, it, vi, beforeEach } from "vitest";
import { setSelectValueHelper } from "./setSelectValueHelper";
import {
  createGraphWithGlobalStore,
  createVertex,
  seedVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

vi.mock("~/lib/graph/mutate/core/channel/broadcastToAllChannels", () => ({
  broadcastToAllChannels: vi.fn(),
}));

vi.mock("~/components/styled/modal/Toast", () => ({
  useToast: () => ({
    showErrorToast: vi.fn(),
    showWarningToast: vi.fn(),
  }),
}));

describe("setSelectValueHelper", () => {
  beforeEach(() => vi.clearAllMocks());

  it("Select stores a single outward selection and inserts missing vertex", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({
      newVertexId_: 50,
    });
    seedVertex(setGraph, createVertex("data", ["Page"]));
    const meta = createVertex("meta", ["Meta"], { key: "role" });
    const option = createVertex("opt1", ["Role"], { key: "Admin" });

    setSelectValueHelper(
      0,
      meta,
      graph.vertexes.data,
      "Select",
      [option as never],
      false,
      graph,
      setGraph,
    );

    expect(graph.vertexes.opt1).toBeDefined();
    expect(graph.vertexes.data.OUT.PageRole?.length).toBe(1);
  });

  it("Select remove clears selection", () => {
    const { graph, setGraph } = createGraphWithGlobalStore({
      newVertexId_: 60,
    });
    seedVertex(setGraph, createVertex("data", ["Page"]));
    const meta = createVertex("meta", ["Meta"], { key: "role" });
    const option = createVertex("opt1", ["Role"], { key: "Admin" });

    setSelectValueHelper(
      0,
      meta,
      graph.vertexes.data,
      "Select",
      [option as never],
      false,
      graph,
      setGraph,
    );
    setSelectValueHelper(
      0,
      meta,
      graph.vertexes.data,
      "Select",
      [],
      true,
      graph,
      setGraph,
    );

    expect(graph.vertexes.data.OUT.PageRole).toBeUndefined();
  });
});
