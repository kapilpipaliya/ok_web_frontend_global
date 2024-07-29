import type { SetStoreFunction } from "solid-js/store";

import jsep from "jsep";

import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";

import { evaluate } from "~/lib/expression_eval";

export function getConfiguredPermissions(currentUserRoleId: Id[], formId: Id | null | undefined, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>) {
  if (!formId) return [];
  const configuredPermissions: Vertex[] = [];

  const allRolePermissions: Vertex[] = evaluate(jsep(`id:'${formId}'->$0GlobalPerm`), { graph, setGraph, vertexes: [] }) || [];
  for (const rp of allRolePermissions) {
    const roles: Vertex[] = evaluate(jsep(`->$0Role`), { graph, setGraph, vertexes: [rp] }) || [];
    if (roles.some(r => currentUserRoleId.includes(r.id))) {
      configuredPermissions.push(rp);
    }
  }

  return configuredPermissions;
}

export function hasPermissions(configuredPermissions: Vertex[], permission: string, graph: GraphInterface, setGraph: SetStoreFunction<GraphInterface>): boolean {
  for (const r of configuredPermissions) {
    const allRolePermissions: Vertex[] = evaluate(jsep(`->$0Perm`), { graph, setGraph, vertexes: [r] }) || [];
    if (allRolePermissions.some(p => p.P.name === permission)) {
      return true;
    }
  }
  return false;
}
