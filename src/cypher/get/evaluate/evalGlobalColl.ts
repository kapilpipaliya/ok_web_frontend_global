
import {getSessionForSubdomain} from "~/cypher/get/getSessionForSubdomain";
import {calculateFilter} from "~/lib/graph/get/sync/traverse";
import {findVertexMGCallId} from "~/cypher/get/findVertexMGCallId";
import type { ContextType } from "./ContextType";

export async function evalGlobalColl(
  edgeType: string,
  context: ContextType = {},
) {
  "use server";
  const session = context.session ||= await getSessionForSubdomain();
  const {type, filter, isMultiple, skip, limit} = calculateFilter(edgeType);

  try {
    return await findVertexMGCallId(
      session,
      {label: type ?? edgeType, skip, limit, name: filter},
      context,
    );
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    if (!context.session) {
      await session.close();
    }
  }
}