import type { SetStoreFunction, Store } from "solid-js/store";

import { batch } from "solid-js";

import { validateInput } from "~/features/page_designer/settings/properties/validations/validateInput";
import { type GraphInterface, IdAttr, type Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

import { commitTxn } from "../../transaction/core/commitTxn";
import { generateNewTxnId } from "../../transaction/core/generateNewTxnId";
import { onChangeHandler } from "./onChangeHandler";

export function setValueGlobal(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  txnId: number,
  metaVertex: Vertex,
  dataVertex: Vertex,
  data: any,
  isRealTime: boolean,
) {
  if (!dataVertex) {
    return;
  }

  // after commit, we can not use same txnId();
  if (isRealTime) {
    txnId = generateNewTxnId(graph, setGraph);
  }
  let error = "" as string | undefined;
  batch(() => {
    if (metaVertex.P.validation) {
      error = validateInput(metaVertex.P.validation, data);
      mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
        error: error || "",
      });
    }

    mergeVertexProperties(txnId, dataVertex.id, graph, setGraph, {
      [metaVertex.P[IdAttr]]: data,
    });

    // we directly save the dataType on vertex:
    // @ts-ignore
    // don't call setGraph directly.
    // setGraph("vertexes", dataVertex.id, "D", {
    //   [metaVertex.P[IdAttr]]: metaVertex.P.dataType,
    // });

    onChangeHandler(txnId, dataVertex, dataVertex, metaVertex, graph, setGraph);
  });

  if (isRealTime) {
    commitTxn(txnId, graph);
  }
}
