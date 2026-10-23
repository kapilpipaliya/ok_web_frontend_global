import type { StoreSetter as SetStoreFunction } from "solid-js";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

/**
 * Draft-first graph mutation.
 *
 * Solid 2 setters are draft-first natively:
 *   setGraph((d) => { d.vertexes[id].P = props; });
 *
 * This helper is the shared call shape for core mutators.
 */
export function produceGraph(
  setGraph: SetStoreFunction<GraphInterface>,
  recipe: (draft: GraphInterface) => void,
): void {
  setGraph(recipe);
}
