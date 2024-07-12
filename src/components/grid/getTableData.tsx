import type { Store } from "solid-js/store";

import type { IFormMetaData } from "~/lib/FormMetadataType";
import type { GraphInterface } from "~/lib/graph/graph";

import { getFormMetaData } from "~/components/page_designer/functions/getChildrenAttrs";
import { getDataMGCall } from "~/cypher/get/getDataMGCall";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";
import { paginationExpression } from "~/lib/graph/get/sync/paginationExpression";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { FormMetaDataAuth } from "~/lib/meta/formMetaDataAuth";

async function getFormAttr(
  tableId: string,
): Promise<{ error: string; form?: IFormMetaData }> {
  let form = FormMetaData[tableId] || FormMetaDataAuth[tableId];
  if (!form) {
    form = FormMetaData.Form;
    const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);
    const data = await getDataMGCall({
      expression: `g:'Form[${tableId}]'`,
      incoming,
      outgoing,
    });
    if (data.result.length > 0) {
      form = getFormMetaData(
        data.graph as Store<GraphInterface>,
        () => {},
        data.result[0],
      );
    }
    if (!form) {
      return { error: "Form not found" };
    }
  }
  return { error: "", form };
}

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
