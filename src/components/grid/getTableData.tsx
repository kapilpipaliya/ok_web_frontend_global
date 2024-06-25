import type { GraphInterface } from "~/lib/graph/graph";
import type { Store } from "solid-js/store";
import { FormMetaDataAuth } from "~/lib/formMetaDataAuth";
import { FormMetaData } from "~/lib/formMetaData";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";
import { paginationExpression } from "~/lib/graph/get/sync/paginationExpression";
import { getDataMGCall } from "~/cypher/get/getDataMGCall";
import { getFormMetaData } from "~/lib/drag_drop/getChildrenAttrs";

export async function getTableData(tableId: string, skip?: number, limit?: number) {
  try {
    let form = FormMetaData[tableId] || FormMetaDataAuth[tableId];
    if (!form) {
      form = FormMetaData.Form;
      const { incoming, outgoing }: { incoming: any; outgoing: any; } = getEdgesFromRowsAttr(form.attributes);
      const data = await getDataMGCall({
        expression: `g:'Form[${tableId}]'`,
        incoming,
        outgoing,
      });
      if (data.result.length > 0) {
        form = getFormMetaData(data.graph as Store<GraphInterface>, () => { }, data.result[0]);
      }
      if (!form) {
        return { error: "Form not found" };
      }
    }
    const { incoming, outgoing }: { incoming: any; outgoing: any; } = getEdgesFromRowsAttr(form.attributes);
    const expression = paginationExpression({
      coll: tableId,
      skip: skip,
      limit: limit,
      filter: "",
    });

    const result = await getDataMGCall({
      expression,
      incoming,
      outgoing,
    });
    return { ...result, form: JSON.parse(JSON.stringify(form)) };
  } catch (e: any) {
    console.error("error", e);
    return { error: `Error When Loading Form: ${e.message}` };
  }
}
