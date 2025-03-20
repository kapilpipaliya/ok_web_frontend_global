import type { Store } from "solid-js/store";

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Id } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import { getEdgesFromGraph } from "~/lib/graph/get/sync/edge/getEdgesFromGraph";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { FieldAttribute, IFormMetaData } from "~/lib/meta/FormMetadataType";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { NestedExpression } from "~/cypher/types/NestedExpression";

export const getFormData = async (
  graph: Store<GraphInterface>,
  metaResult: {
    data?: ServerResult;
    form?: IFormMetaData;
  },
  dataId: Id,
): Promise<{ data?: ServerResult; error: string }> => {
  try {
    let incoming: NestedExpression[] = [];
    let outgoing: NestedExpression[] = [];
    if (metaResult.form) {
      ({ incoming, outgoing } = getEdgesFromRowsAttr(metaResult.form.attributes));
    } else if (metaResult.data) {
      ({ incoming, outgoing } = getEdgesFromGraph(metaResult.data.graph as GraphInterface, metaResult.data.result[0].id));
    }
    const result = await fetchDataFromDB({
      expression: `id:'${dataId}'`,
      [getGlobalStore(graph).P.url]: true,
      incoming,
      outgoing,
    });

    if (!(isValidResponse(result) && result.graph)) {
      return { error: getErrorMessage(result) || "Error When Loading Form" };
    }

    return { data: result, error: "" };
  } catch (e: any) {
    console.error("error", e);
    return { error: `Error When Loading Form: ${e.message}` };
  }
};
