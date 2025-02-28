import type { Store } from "solid-js/store";

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { GraphInterface, Id } from "~/lib/graph/graph";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { getErrorMessage } from "~/lib/api/getErrorMessage";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";

export const getFormData = async (
  graph: Store<GraphInterface>,
  metaAttrs: FieldAttribute[],
  id: Id,
): Promise<{ data?: ServerResult; error: string }> => {
  try {
    const { incoming, outgoing } = getEdgesFromRowsAttr(metaAttrs);
    const result = await fetchDataFromMG({
      expression: `id:'${id}'`,
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
