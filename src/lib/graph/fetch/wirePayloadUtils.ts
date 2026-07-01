import { isObject } from "~/lib/data_structure/object/isObject";
import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Id } from "~/lib/graph/type/id";

export function extractRootIdFromResult(
  serverResult?: ServerResult,
): Id | undefined {
  if (!serverResult?.result) {
    return undefined;
  }

  if (Array.isArray(serverResult.result)) {
    if (serverResult.result.length > 0) {
      return serverResult.result[0].id;
    }
    return undefined;
  }

  if (isObject(serverResult.result)) {
    return serverResult.result.id;
  }

  return undefined;
}

export function stripResultFromServerResult(serverResult?: ServerResult) {
  if (serverResult) {
    delete serverResult.result;
  }
}
