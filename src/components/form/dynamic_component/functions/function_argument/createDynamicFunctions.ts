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
  meta: () => Vertex,
  getFunctionArgumentWithValue: Accessor<FunctionArgumentType>,
  parentRenderContext: () => { context: FunctionArgumentType } | undefined,
  componentName: Accessor<string>,
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

      // If owner is available, run within that context; otherwise run directly
      return owner ? runWithOwner(owner, evaluate) : evaluate();
    };

    // Memoize meta functions - only re-evaluate when meta.P.fns changes
    const metaFnsMemo = createMemo(() => {
      const currentMeta = meta();
      return evaluateFns(currentMeta.P.fns);
    });

    // Memoize component vertex lookup - only when componentName changes
    const componentVertexMemo = createMemo(() => {
      const name = componentName();
      return untrack(() =>
        findVertexByLabelAndUniqueId(graph, "Component", "key", name),
      );
    });

    // Memoize component functions - only re-evaluate when component vertex changes
    const componentFnsMemo = createMemo(() => {
      const vertex = componentVertexMemo();
      return vertex ? evaluateFns(vertex.P.fns) : undefined;
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

          // Check component functions
          const componentFns = componentFnsMemo();
          if (componentFns && key in componentFns) {
            return componentFns[key];
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
