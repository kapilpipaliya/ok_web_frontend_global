import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { paginationExpression } from "~/lib/graph/get/sync/paginationExpression";

export async function getTableData(
  form: IFormMetaData,
  tableId: string,
  skip?: number,
  limit?: number,
) {
  try {
    const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes, true);
    const expression = paginationExpression({
      coll: tableId,
      filter: "",
      limit: limit,
      skip: skip,
    });

    const result = await fetchDataFromMG({
      expression,
      incoming,
      outgoing,
    });
    return result;
  } catch (e: any) {
    console.error("error", e);
    return { error: `Error When Loading Form2: ${e.message}` };
  }
}
