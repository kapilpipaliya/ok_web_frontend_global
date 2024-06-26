import { onCleanup, } from "solid-js";
import type { Store, SetStoreFunction } from "solid-js/store";
import type { GraphInterface, Vertex } from "../../graph";
import { addNewVertex, newVertex } from "../vertex";
import { klona } from "klona/json";
import { useToast } from "~/components/Toast";
import type { FieldAttribute, IFormMetaData } from "~/lib/FormMetadataType";
import { newRow } from "./rowFunction";
import { getNewTxnId, getNewGraphId, revertTransaction } from "../../transaction";

export function addMetaVertexes(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  vertex: Vertex,
  attributes: FieldAttribute[]
) {
  const { showErrorToast } = useToast();

  for (const attribute of attributes) {
    // if (attribute?.props?.skip) {
    //   continue;
    // }
    const attr = klona(attribute);
    if (!attr.tab) attr.tab = "main";
    // @ts-ignore
    if (!attr.group) attr.group = "main";
    // if(attribute.component === "Table2") attribute.group = attribute.id;
    const addAttributeResult = newRow(
      graph,
      setGraph,
      txnId,
      vertex,
      "MetaAttr",
      "MetaAttr",
      attr
    );
    if (addAttributeResult.error) {
      showErrorToast(addAttributeResult.error.toString());
    }
    // todo discard transaction
    // if (attribute.component === "Table2" && attribute.attributes) {
    if (attribute.attributes) {
      addMetaVertexes(
        graph,
        setGraph,
        txnId,
        graph.vertexes[addAttributeResult.vertexId!],
        attribute.attributes
      );
    }
    // todo discard transaction
  }
}export function createMeta(
  form: IFormMetaData,
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>
): { error: boolean; vertex?: Vertex; } {
  const { attributes, ...custom } = form;

  // save attributes to vertexes
  const metaTxnId = getNewTxnId(graph, setGraph);

  const metaMainVertex = newVertex(getNewGraphId(), ["Temp"], custom);
  const { error } = addNewVertex(metaTxnId, metaMainVertex, graph, setGraph);
  if (error) {
    console.error(error);
    return { error: true };
  }
  const metaVertex = graph.vertexes[metaMainVertex.id];

  addMetaVertexes(graph, setGraph, metaTxnId, metaVertex, attributes);
  onCleanup(() => {
    revertTransaction(metaTxnId, graph);
  });
  onCleanup(() => {
    // TODO: Remove all the meta
  });

  return { error: false, vertex: metaVertex };
}

