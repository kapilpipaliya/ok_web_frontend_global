import type { SetStoreFunction, Store } from "solid-js/store";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

import { evalExpression } from "~/lib/expression_eval";

export interface NavItem {
  children?: NavItem[];
  expanded: boolean;
  id: string;
  name: string;
  P: any;
}

export function getTreeData(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  treeLevels: { [key: string]: any },
  vertexes: Vertex[] = [],
  options?: {
    addChild?: (child: Vertex) => boolean;
    nameExpr?: (child: Vertex) => string;
  },
): NavItem[] {
  const getChildren = (
    levels: { [key: string]: any },
    vertexes: Vertex[],
  ): NavItem[] => {
    const result: NavItem[] = [];
    if (!levels.collection) {
      return result;
    }
    const children = evalExpression(levels.collection, {
      graph,
      setGraph,
      vertexes: vertexes,
    });
    for (const child of (children || []).sort(
      (a: any, b: any) => a.P.pos - b.P.pos,
    )) {
      const name =
        levels?.nameExpr?.(child) || options?.nameExpr?.(child) || child.P.name;
      const navItem: NavItem = {
        expanded: true,
        id: child.id,
        name: name,
        P: child.P,
      };
      if (
        levels.child &&
        ((levels?.addChild?.(child) || options?.addChild?.(child)) ?? true)
      ) {
        navItem.children = getChildren(levels.child, [child]);
      }

      result.push(navItem);
    }
    return result;
  };

  return getChildren(treeLevels, vertexes);
}
