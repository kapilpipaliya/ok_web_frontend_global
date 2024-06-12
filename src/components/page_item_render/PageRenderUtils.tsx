import type {Store} from "solid-js/store";
import {GraphInterface, IdAttr, Vertex} from "~/lib/graph/graph";
import {getChildVertex} from "~/lib/graph/get/sync/traverse";
import {getCollAttrComp} from "~/lib/graph/get/sync/graph_functions";

export const PageRenderUtils = {
  getCollection: (
    graph: Store<GraphInterface>,
    item?: Vertex,
  ): string | undefined =>
    item && getChildVertex(graph, ["$0Coll"], item).vertex?.P[IdAttr],
  getAttrVertex: (
    graph: Store<GraphInterface>,
    item?: Vertex,
  ): Vertex | undefined =>
    item && getChildVertex(graph, ["$0Att"], item).vertex,
  getAttr: (graph: Store<GraphInterface>, item?: Vertex): string | undefined =>
    item && PageRenderUtils.getAttrVertex(graph, item)?.P[IdAttr],
  getID: (item?: Vertex): string | undefined => item?.P.name,
  getId: (graph: Store<GraphInterface>, item?: Vertex): string | undefined =>
    PageRenderUtils.getAttr(graph, item) || PageRenderUtils.getID(item) || "",
  // get component or Attribute component
  getComponent: (
    graph: Store<GraphInterface>,
    item?: Vertex,
  ): Vertex | undefined => {
    if (!item) return;

    const currentComp = getChildVertex(graph, ["$0Comp"], item).vertex;
    if (currentComp) return currentComp;

    const attrVertex = PageRenderUtils.getAttrVertex(graph, item);
    if (!attrVertex) return;
    return getCollAttrComp(attrVertex, graph);
  },
  getDataVertex: (graph: Store<GraphInterface>, item?: Vertex) =>
    item && getChildVertex(graph, ["$0Data"], item).vertex,
};