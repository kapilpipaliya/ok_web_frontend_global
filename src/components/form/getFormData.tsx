import type { ServerResult } from "~/cypher/get/ServerResult";
import type { Id } from "~/lib/graph/graph";

import { getDataMGCall } from "~/cypher/get/getDataMGCall";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { FormMetaDataAuth } from "~/lib/meta/formMetaDataAuth";

export const getFormData = async (
  formId: string,
  id: Id,
): Promise<{ error: string; graph?: ServerResult["graph"] }> => {
  try {
    const form = FormMetaData[formId] || FormMetaDataAuth[formId] || FormMetaData.Form;
    const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);
    const result = await getDataMGCall({
      expression: `id:'${id}'`,
      incoming,
      outgoing,
    });

    // @ts-ignore
    if (result.error || !result.graph) {
      // @ts-ignore
      return { error: result.error || "Error When Loading Form" };
    }

    return { error: "", graph: result.graph };
  } catch (e: any) {
    console.error("error", e);
    return { error: `Error When Loading Form: ${e.message}` };
  }
};
