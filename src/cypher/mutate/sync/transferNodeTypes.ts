import type { Session } from "neo4j-driver";

import { processNodeSync } from "~/cypher/mutate/sync/processNodeSync";
import { FormMetaData } from "~/lib/formMetaData";
import { FormMetaDataAuth } from "~/lib/formMetaDataAuth";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";

export async function transferNodeTypes(
  sessionSource: Session,
  sessionTarget: Session,
  nodesToTransfer: string[],
) {
  for (const nodeType of nodesToTransfer) {
    const form = FormMetaData[nodeType] || FormMetaDataAuth[nodeType];

    if (!form) return "Error";
    const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);

    const result = await processNodeSync(
      sessionSource,
      sessionTarget,
      {
        expression: `g:'${nodeType}'`,
        incoming,
        outgoing,
      },
      [],
      false,
    );
  }
}
