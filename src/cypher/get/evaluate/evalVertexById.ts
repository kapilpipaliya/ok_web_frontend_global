import { findVertexMGCallId } from "~/cypher/get/evaluate/findVertexMGCallId";

import type { ContextType } from "../../types/ContextType";

export async function evalVertexById(id: string, context: ContextType = {}) {
  "use server";
  return await findVertexMGCallId({ id }, context);
}
