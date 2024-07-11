import jsep from "jsep";

import type { Edge, Vertex } from "~/lib/graph/graph";

import { evalAsync } from "~/lib/expression_eval";

export async function getTreeDataMGCall(
  treeLevels: { [key: string]: any },
  vertexes: Vertex[] = [],
  options?: {
    addChild?: (child: Vertex) => boolean;
    nameExpr?: (child: Vertex) => string;
  },
) {
  "use server";
  const nodes: { [key: string]: Vertex } = {};
  const relationships: { [key: string]: Edge } = {};
  const getChildren = async (
    levels: { [key: string]: any },
    vertexes: Vertex[],
  ) => {
    const result: {}[] = [];
    if (!levels.collection) return result;

    const children = await evalAsync(jsep(levels.collection), {
      nodes,
      relationships,
      vertexes: vertexes,
    });
    // @ts-ignore
    for (const child of (children || []).sort((a, b) => a.P.pos - b.P.pos)) {
      const name =
        levels?.nameExpr?.(child) || options?.nameExpr?.(child) || child.P.name;
      const navItem = {};
      // @ts-ignore
      navItem.name = name;
      // @ts-ignore
      navItem.expanded = true;
      // @ts-ignore
      navItem.id = child.id;
      // @ts-ignore
      navItem.P = child.P;
      if (
        levels.child &&
        ((levels?.addChild?.(child) || options?.addChild?.(child)) ?? true)
      ) {
        // @ts-ignore
        navItem.children = await getChildren(levels.child, [child]);
      }

      result.push(navItem);
    }
    return result;
  };

  const children = await getChildren(treeLevels, vertexes);
  return {
    children,
    graph: {
      edges: relationships,
      vertexes: nodes,
    },
  };
}
