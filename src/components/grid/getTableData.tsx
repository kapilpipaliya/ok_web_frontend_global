

import { getDataMGCall } from "~/cypher/get/getDataMGCall";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";
import { paginationExpression } from "~/lib/graph/get/sync/paginationExpression";

import { getFormAttr } from "./getFormAttr";

export async function getTableData(
  tableId: string,
  skip?: number,
  limit?: number,
) {
  try {
    const formAttrResult = await getFormAttr(tableId);
    if (formAttrResult.error) {
      return { error: formAttrResult.error };
    }

    const { incoming, outgoing } = getEdgesFromRowsAttr(
      formAttrResult.form!.attributes,
      true,
    );
    const expression = paginationExpression({
      coll: tableId,
      filter: "",
      limit: limit,
      skip: skip,
    });

    const result = await getDataMGCall({
      expression,
      incoming,
      outgoing,
    });
    return { ...result, form: JSON.parse(JSON.stringify(formAttrResult.form)) };
  } catch (e: any) {
    console.error("error", e);
    return { error: `Error When Loading Form: ${e.message}` };
  }
}
