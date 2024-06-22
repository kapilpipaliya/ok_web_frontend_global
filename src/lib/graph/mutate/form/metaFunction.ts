import { onCleanup, untrack, useContext } from "solid-js";
import type { Store, SetStoreFunction } from "solid-js/store";
import { NewTxnIdContext } from "~/lib/contexts";
import { removeUndefinedProperties } from "~/lib/removeUndefinedProperties";
import { componentProps } from "../../get/sync/graph_functions";
import type { GraphInterface, Vertex } from "../../graph";
import { addNewVertex, mergeVertexProperties, newVertex } from "../vertex";
import { klona } from "klona/json";
import { useToast } from "~/components/Toast";
import type { FieldAttribute, IFormMetaData } from "~/lib/FormMetadataType";
import { newRow } from "./rowFunction";
import { getNewTxnId, getNewGraphId, revertTransaction } from "../../transaction";

// add meta from vertex value:
export function addMeta(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  metaVertex: Vertex,
  data: Vertex
) {
  if (metaVertex.P.meta) {
    const metaData = componentProps(graph, setGraph, metaVertex, data);
    const metaDataVal = removeUndefinedProperties(metaData, false, 10);
    untrack(() => {
      const newMetaData = Object.assign(
        {},
        // when component is rendered dynamically graph.vertexes[metaVertex.P.templateId] value is undefined
        graph.vertexes[metaVertex.P.templateId]?.P?.props || {},
        metaDataVal
      );
      mergeVertexProperties(
        useContext(NewTxnIdContext),
        metaVertex.id,
        graph,
        setGraph,
        {
          props: newMetaData,
        }
      );
    });
  }
}
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

