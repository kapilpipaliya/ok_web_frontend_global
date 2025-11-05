import type { ServerResult } from "~/cypher/types/ServerResult";
import type { EvalExpressionContext } from "../types/EvalExpressionContext";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";
import {
  executeNamedServerFunctionCore,
  type NamedServerFunctionRequest,
} from "~/cypher/get/executeNamedServerFunctionCore";

/**
 * Execute a named server function (with "use server" for API/UI calls)
 */
export async function executeNamedServerFunction(
  request: NamedServerFunctionRequest,
  context: EvalExpressionContext & {
    [key: `$${string}`]: any;
  } = {
    nodes: {} as { [key: string]: Vertex },
    relationships: {} as { [key: string]: Edge },
    vertexes: undefined as any,
  },
): Promise<ServerResult> {
  "use server";
  return executeNamedServerFunctionCore(request, context);
}
