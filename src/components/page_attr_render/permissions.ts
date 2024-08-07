import type { SetStoreFunction } from "solid-js/store";

import jsep from "jsep";

import type { GraphInterface, Id, Vertex } from "~/lib/graph/graph";

import { evaluate } from "~/lib/expression_eval";

export function getConfiguredPermissions(
  currentUserRoleId: Id[],
  vertex: null | undefined | Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (!vertex?.L) {
    return [];
  }
  const configuredPermissions: Vertex[] = [];

  const allRolePermissions: Vertex[] =
    evaluate(jsep(`->$0${vertex.L?.[0] !== "Attr" ? "Global" : ""}Perm`), {
      graph,
      setGraph,
      vertexes: [vertex],
    }) || [];
  for (const rp of allRolePermissions) {
    const roles: Vertex[] =
      evaluate(jsep("->$0Role"), { graph, setGraph, vertexes: [rp] }) || [];
    if (roles.some((r) => currentUserRoleId.includes(r.id))) {
      configuredPermissions.push(rp);
    }
  }

  return configuredPermissions;
}

export function hasPermissions(
  configuredPermissions: Vertex[],
  permission: string,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  for (const r of configuredPermissions) {
    const allRolePermissions: Vertex[] =
      evaluate(jsep("->$0Perm"), { graph, setGraph, vertexes: [r] }) || [];
    if (allRolePermissions.some((p) => p.P.name === permission)) {
      return true;
    }
  }
}

/*
export function inheritPermissions(
  permissionsArray: [] | PageRenderStore[],
  permissionKey: keyof typeof InitialPermissions
): boolean | undefined {
  for (let i = permissionsArray.length - 1; i >= 0; i--) {
    const permissionValue = permissionsArray[i][0][permissionKey];
    if (permissionValue !== undefined) {
      return permissionValue;
    }
  }
  return undefined;
}*/
