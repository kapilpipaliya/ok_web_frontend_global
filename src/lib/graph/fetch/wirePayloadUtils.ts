import { isObject } from "~/lib/data_structure/object/isObject";
import type { ServerResult } from "~/cypher/types/ServerResult";
import type { Id } from "~/lib/graph/type/id";
import { prepareGraphForWireTransfer } from "~/lib/graph/fetch/graphFetchUtils";

export type ComponentGraphData = Pick<ServerResult, "graph">;

export type WireTransferOptions = { isDesignMode?: boolean };

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

/** Strip adjacency / designer-only fields and drop `result` for `/_server`. */
export function prepareServerResultForWire(
  serverResult?: ServerResult,
  options?: WireTransferOptions,
): void {
  if (!serverResult) {
    return;
  }
  prepareGraphForWireTransfer(serverResult.graph, options);
  stripResultFromServerResult(serverResult);
}

/** Wire-safe component slice: `{ graph }` only, after prepare. */
export function toComponentGraphData(
  serverResult?: ServerResult,
  options?: WireTransferOptions,
): ComponentGraphData | undefined {
  if (!serverResult?.graph) {
    return undefined;
  }
  prepareGraphForWireTransfer(serverResult.graph, options);
  return { graph: serverResult.graph };
}
