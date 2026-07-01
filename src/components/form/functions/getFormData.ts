import type { NestedExpression } from "~/cypher/types/NestedExpression";
import type { ServerResult } from "~/cypher/types/ServerResult";

import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import type { Id } from "~/lib/graph/type/id";

export const getFormData = async (
  dataId: Id,
  edges: {
    incoming: NestedExpression[];
    outgoing: NestedExpression[];
  },
): Promise<{ data?: ServerResult; error: string }> => {
  try {
    const result = await fetchDataFromDB({
      expression: `id:'${dataId}'`,
      incoming: edges.incoming,
      outgoing: edges.outgoing,
    });

    if (!(isValidResponse(result) && result.graph)) {
      return { error: getErrorMessage(result) || "Error When Loading Page" };
    }

    return { data: result, error: "" };
  } catch (e: unknown) {
    console.error("error", e);
    return {
      error: `Error When Loading Page: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
};
