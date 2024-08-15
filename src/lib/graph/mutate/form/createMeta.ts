import type { SetStoreFunction, Store } from "solid-js/store";

import { toTitle } from "case-switcher-js";
import { klona } from "klona/json";
import { onCleanup } from "solid-js";

import type {
  FieldAttribute,
  IFormMetaData,
} from "~/lib/meta/FormMetadataType";

import { useToast } from "~/components/Toast";

import type { GraphInterface, Vertex } from "../../graph";

import { revertTransaction } from "../../transaction/revertTransaction";
import { addNewVertex, newVertex } from "../vertex";
import { newRow } from "./addNewRow";

export function addMetaVertexes(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  vertex: Vertex,
  attributes: FieldAttribute[],
) {
  const { showErrorToast } = useToast();

  for (const attribute of attributes) {
    // if (attribute?.props?.skip) {
    //   continue;
    // }
    const attr = klona(attribute);
    if (attr.name) {
      attr.label = toTitle(attr.name);
    }
    if (!attr.tab) {
      attr.tab = "main";
    }
    // @ts-ignore
    if (!attr.group) {
      attr.group = "main";
    }
    // if(attribute.componentName === "DynamicTable") attribute.group = attribute.id;
    const addAttributeResult = newRow(
      graph,
      setGraph,
      txnId,
      vertex,
      "Attr",
      "Attr",
      attr,
    );
    if (addAttributeResult.error) {
      showErrorToast(addAttributeResult.error.toString());
    }
    // todo discard transaction
    // if (attribute.componentName === "DynamicTable" && attribute.attributes) {
    if (attribute.attributes) {
      addMetaVertexes(
        graph,
        setGraph,
        txnId,
        graph.vertexes[addAttributeResult.vertexId!],
        attribute.attributes,
      );
    }
    // todo discard transaction
  }
}
export function createMeta(
  form: IFormMetaData,
  metaTxnId: number,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
): { error: string; txnId?: number; vertex?: Vertex } {
  const { attributes, ...custom } = form;
  // save attributes to vertexes
  const metaMainVertex = newVertex(graph.newVertexId, ["Temp"], custom);
  const { error } = addNewVertex(metaTxnId, metaMainVertex, graph, setGraph);
  if (error) {
    console.error(error);
    return { error };
  }
  const metaVertex = graph.vertexes[metaMainVertex.id];

  addMetaVertexes(graph, setGraph, metaTxnId, metaVertex, attributes);

  return { error: "", txnId: metaTxnId, vertex: metaVertex };
}
