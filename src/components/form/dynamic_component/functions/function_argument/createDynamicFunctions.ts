import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";
import { createMemo, type Accessor, untrack, runWithOwner } from "solid-js";

/**
 * Creates dynamic functions for the component with memoization
 */
export function createDynamicFunctions(
  graph: GraphInterface,
  meta: () => Vertex | undefined,
  getFunctionArgumentWithValue: Accessor<FunctionArgumentType>,
  parentRenderContext: () => { context: FunctionArgumentType } | undefined,
): Record<string, unknown> {
  try {
    // Helper to evaluate fns from a vertex
    // Runs within the component's owner context so reactive primitives work correctly
    const evaluateFns = (
      fns:
        | ((args: FunctionArgumentType) => Record<string, unknown>)
        | string
        | undefined
        | null,
    ): Record<string, unknown> | undefined => {
      const args = getFunctionArgumentWithValue();
      const owner = args.owner;

      // Run evaluation within the component's owner context
      // This ensures createEffect, createMemo, etc. are properly attached to the component's lifecycle
      const evaluate = () => {
        if (typeof fns === "function") {
          return fns(args);
        }
        if (typeof fns === "string" && fns.trim() !== "") {
          try {
            return new Function("args", fns)(args);
          } catch (error) {
            console.error("Error evaluating fns:", error);
            return undefined;
          }
        }
        return undefined;
      };

      // If owner is available, run within that context; otherwise throw error
      if (!owner) {
        const error = "Owner context is required but not found in function arguments."
        console.error(error, args);
        throw new Error(error);
      }
      return runWithOwner(owner, evaluate);
    };

    // Memoize meta functions - only re-evaluate when meta.P.fns changes
    const metaFnsMemo = createMemo(() => {
      const currentMeta = meta();
      return currentMeta ? evaluateFns(currentMeta.P.fns) : undefined;
    });

    return new Proxy(
      {},
      {
        get(_, key: string) {
          // Check meta functions first
          const metaFns = metaFnsMemo();
          if (metaFns && key in metaFns) {
            return metaFns[key];
          }

          // Fallback to parent context
          return parentRenderContext()?.context?.fns?.[key];
        },
      },
    );
  } catch (error) {
    console.error("Error in dynamicFns:", error);
    return parentRenderContext()?.context?.fns ?? {};
  }
}
