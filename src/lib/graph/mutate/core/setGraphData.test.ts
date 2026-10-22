import { describe, expect, it, vi, beforeEach } from "vitest";
import { setGraphData, updateVertex, updateEdge } from "./setGraphData";
import {
  createEmptyGraph,
  createEdge,
  createVertex,
} from "~/lib/graph/__tests__/helpers/createTestGraph";

vi.mock("~/lib/graph/mutate/core/channel/broadcastToAllChannels", () => ({
  broadcastToAllChannels: vi.fn(),
}));

describe("setGraphData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("alert", vi.fn());
  });

  it("loads vertexes/edges and restores adjacency from edges", () => {
    const { graph, setGraph } = createEmptyGraph();
    setGraphData(
      graph,
      setGraph,
      {
        vertexes: {
          a: createVertex("a", ["Page"], { key: "Home" }),
          b: createVertex("b", ["Attr"], { key: "title" }),
        },
        edges: {
          e1: createEdge("e1", "Attr", "a", "b"),
        },
      },
      { skipTransactionDetail: true },
    );

    expect(graph.vertexes.a.P.key).toBe("Home");
    expect(graph.vertexes.a.OUT.Attr).toEqual(["e1"]);
    expect(graph.vertexes.b.IN.Attr).toEqual(["e1"]);
    expect(graph.edges.e1.T).toBe("Attr");
    expect(graph.vertexLabelIdMap.Page).toContain("a");
  });

  it("fills missing IN/OUT when edges are absent", () => {
    const { graph, setGraph } = createEmptyGraph();
    const stripped = createVertex("a", ["Page"], { key: "Home" }) as {
      IN?: unknown;
      OUT?: unknown;
      id: string;
      L: string[];
      P: Record<string, unknown>;
    };
    delete stripped.IN;
    delete stripped.OUT;

    setGraphData(
      graph,
      setGraph,
      { vertexes: { a: stripped as never }, edges: {} },
      { skipTransactionDetail: true },
    );

    expect(graph.vertexes.a.IN).toEqual({});
    expect(graph.vertexes.a.OUT).toEqual({});
  });

  it("updateVertex merges IN/OUT and respects skipExisting", () => {
    const { graph, setGraph } = createEmptyGraph();
    updateVertex(
      "a",
      createVertex("a", ["Page"], { v: 1 }, { OUT: { Attr: ["e1"] } }),
      graph,
      setGraph,
    );
    updateVertex(
      "a",
      createVertex("a", ["Page"], { v: 2 }, { OUT: { Attr: ["e2"] } }),
      graph,
      setGraph,
    );
    expect(graph.vertexes.a.P.v).toBe(2);
    expect(graph.vertexes.a.OUT.Attr).toEqual(["e2", "e1"]);

    updateVertex(
      "a",
      createVertex("a", ["Page"], { v: 3 }),
      graph,
      setGraph,
      { skipExisting: true },
    );
    expect(graph.vertexes.a.P.v).toBe(2);
  });

  it("updateEdge wires adjacency", () => {
    const { graph, setGraph } = createEmptyGraph();
    updateVertex("a", createVertex("a", ["Page"]), graph, setGraph);
    updateVertex("b", createVertex("b", ["Attr"]), graph, setGraph);
    updateEdge("e1", createEdge("e1", "Attr", "a", "b"), graph, setGraph);
    expect(graph.vertexes.a.OUT.Attr).toEqual(["e1"]);
    expect(graph.vertexes.b.IN.Attr).toEqual(["e1"]);
  });
});
