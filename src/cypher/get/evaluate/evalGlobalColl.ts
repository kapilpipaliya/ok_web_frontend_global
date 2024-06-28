
import {calculateFilter} from "~/lib/graph/get/sync/traverse";
import {findVertexMGCallId} from "~/cypher/get/evaluate/findVertexMGCallId";
import type { ContextType } from "./ContextType";

export async function evalGlobalColl(
  edgeType: string,
  context: ContextType = {},
) {
  "use server";
  const {type, filter, isMultiple, skip, limit} = calculateFilter(edgeType);
    return await findVertexMGCallId(
      {label: type ?? edgeType, skip, limit, name: filter},
      context,
    );

}