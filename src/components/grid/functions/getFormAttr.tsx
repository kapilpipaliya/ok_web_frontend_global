import type { Store } from "solid-js/store";

import type { GraphInterface } from "~/lib/graph/graph";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { getFormMetaData } from "~/components/page_designer/functions/getChildrenAttrs";
import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { FormMetaDataAuth } from "~/lib/meta/formMetaDataAuth";

export async function getFormAttr(
  tableId: string
): Promise<{ error: string; form?: IFormMetaData; }> {
  let form = FormMetaData[tableId] || FormMetaDataAuth[tableId];
  if (!form) {
    form = FormMetaData.Form;
    const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);
    const data = await fetchDataFromMG({
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
      return { error: `Form not found: ${tableId}` };
    }
  }
  return { error: "", form };
}
