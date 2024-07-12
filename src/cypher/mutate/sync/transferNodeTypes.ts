import type { Session } from "neo4j-driver";

import { processNodeSync } from "~/cypher/mutate/sync/processNodeSync";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { FormMetaDataAuth } from "~/lib/meta/formMetaDataAuth";

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
