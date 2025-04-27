import type { Id, Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

import { evalExpression } from "~/lib/expression_eval";
import { PermissionLevel } from "~/pages/PageViewWrapper";

export function getConfiguredPermissions(
  currentUserRoleId: Id[],
  vertex: null | undefined | Vertex,
  graph: GraphInterface,
) {
  if (!vertex?.L) {
    return [];
  }
  const configuredPermissions: Vertex[] = [];
  const label = vertex.L[0];
   // RolePagePage
  const allRolePermissions: Vertex[] =
    evalExpression(`<-Role$0$0`, {
      graph,
      setGraph: () => {},
      vertexes: [vertex],
    }) || [];
  for (const rp of allRolePermissions) {
    // RolePage
    const roles: Vertex[] =
      evalExpression(`<-Role${label}`, {
        graph,
        setGraph: () => {},
        vertexes: [rp],
      }) || [];
    if (roles.some((r) => currentUserRoleId.includes(r.id))) {
      configuredPermissions.push(rp);
    }
  }
  return configuredPermissions;
}

export function hasPermissions(
  configuredPermissions: Vertex[],
  permission: PermissionLevel,
) {
  for (const r of configuredPermissions) {
    // Check if the configured permission matches or is higher level than requested
    if (r.P.access === permission) {
      return true;
    }
    // Higher level permissions implicitly grant lower level permissions
    if (permission === PermissionLevel.VIEW && 
        [PermissionLevel.EDIT, PermissionLevel.FULL, PermissionLevel.CREATE].includes(r.P.access)) {
      return true;
    }
    if (permission === PermissionLevel.CREATE && 
        [PermissionLevel.EDIT, PermissionLevel.FULL].includes(r.P.access)) {
      return true;
    }
    if (permission === PermissionLevel.EDIT && 
        PermissionLevel.FULL === r.P.access) {
      return true;
    }
  }
  return false;
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
