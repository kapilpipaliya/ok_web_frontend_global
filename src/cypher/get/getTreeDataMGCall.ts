import type {Edge, Vertex} from "~/lib/graph/graph";
import {evalAsync} from "~/lib/expression_eval";
import jsep from "jsep";

export async function getTreeDataMGCall(
  treeLevels: { [key: string]: any },
  vertexes: Vertex[] = [],
  options?: {
    nameExpr?: (child: Vertex) => string;
    addChild?: (child: Vertex) => boolean;
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
      vertexes: vertexes,
      nodes,
      relationships,
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
      vertexes: nodes,
      edges: relationships,
    },
  };
}