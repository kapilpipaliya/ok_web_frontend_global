import { findVertexMGCallId } from "~/cypher/get/evaluate/findVertexMGCallId";
import { calculateFilter } from "~/lib/graph/get/sync/calculateFilter";

import type { ContextType } from "../../types/ContextType";

export async function evalGlobalColl(
  edgeType: string,
  context: ContextType = {},
) {
  "use server";
  const { filter, isMultiple, limit, skip, type } = calculateFilter(edgeType);
  return await findVertexMGCallId(
    { label: type ?? edgeType, limit, name: filter, skip },
    context,
  );
}
