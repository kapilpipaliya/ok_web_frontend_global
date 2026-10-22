import { produce, type SetStoreFunction } from "solid-js/store";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

/**
 * Draft-first graph mutation (Solid 1 `produce` → Solid 2 native draft setters).
 *
 * Solid 1 path style:
 *   setGraph("vertexes", id, "P", props);
 *
 * Solid 2 / this helper:
 *   produceGraph(setGraph, (d) => {
 *     d.vertexes[id].P = props; // replace
 *     // Object.assign(d.vertexes[id].P, props); // merge
 *   });
 *
 * On Solid 2, replace the body with `setGraph((d) => { ... })` and drop `produce`.
 */
export function produceGraph(
  setGraph: SetStoreFunction<GraphInterface>,
  recipe: (draft: GraphInterface) => void,
): void {
  setGraph(produce(recipe));
}
