import {
  type GraphInterface, IdAttr,
  type Vertex
} from "~/lib/graph/graph";
import { commitTxn, getNewTxnId } from "../../transaction";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import type { SetStoreFunction, Store } from "solid-js/store";
import { onChangeHandler } from "./onChangeHandler";
import { validateInput } from "~/components/page_designer/settings/validateInput";
import { batch } from "solid-js";


export function setValueGlobal(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  metaVertex: Vertex,
  dataVertex: Vertex,
  data: any,
  isRealTime: boolean
) {
  if (!dataVertex) {
    return;
  }

  // after commit, we can not use same txnId();
  if (isRealTime) {
    txnId = getNewTxnId(graph, setGraph);
  }
  let error = "" as string | undefined;
  batch(() => {
    if (metaVertex.P.validation) {
      error = validateInput(metaVertex.P.validation, data);
      mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
        error: error || ""
      });
    }
  
    mergeVertexProperties(txnId, dataVertex.id, graph, setGraph, {
      [metaVertex.P[IdAttr]]: data,
    });
  
    // we directly save the dataType on vertex:
    // @ts-ignore
    setGraph("vertexes", dataVertex.id, "D", {
      [metaVertex.P[IdAttr]]: metaVertex.P.dataType,
    });
  
    onChangeHandler(txnId, dataVertex, dataVertex, metaVertex, graph, setGraph);
  })

  if (isRealTime) commitTxn(txnId, graph);
}
