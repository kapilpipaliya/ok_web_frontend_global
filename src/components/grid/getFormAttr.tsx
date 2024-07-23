import type { Store } from "solid-js/store";

import type { IFormMetaData } from "~/lib/FormMetadataType";
import type { GraphInterface } from "~/lib/graph/graph";

import { getFormMetaData } from "~/components/page_designer/functions/getChildrenAttrs";
import { getDataMGCall } from "~/cypher/get/getDataMGCall";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { FormMetaDataAuth } from "~/lib/meta/formMetaDataAuth";

export async function getFormAttr(
  tableId: string
): Promise<{ error: string; form?: IFormMetaData; }> {
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
        () => { },
        data.result[0]
      );
    }
    if (!form) {
      return { error: "Form not found" };
    }
  }
  return { error: "", form };
}
