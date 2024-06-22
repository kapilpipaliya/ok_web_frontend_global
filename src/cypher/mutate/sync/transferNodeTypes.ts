import { type Session} from "neo4j-driver";
import {getFormMetaDataAsync} from "~/cypher/get/getFormMetaDataAsync";
import {getEdgesFromRowsAttr} from "~/lib/getEdgesFromRowsAttr";

import {processNodeSync} from "~/cypher/mutate/sync/processNodeSync";

export async function transferNodeTypes(
  sessionSource: Session,
  sessionTarget: Session,
  nodesToTransfer: string[],
) {
  for (const nodeType of nodesToTransfer) {
    const form = await getFormMetaDataAsync(
      nodeType,
    );
    if (form.error) return "Error";
    const {incoming, outgoing}: { incoming: any; outgoing: any } =
      getEdgesFromRowsAttr(form.form!.attributes);

    const result = await processNodeSync(sessionSource, sessionTarget, {
      expression: `g:'${nodeType}'`,
      incoming,
      outgoing,
    }, [], false);
  }
}