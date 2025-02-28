import { evalExpression } from "~/lib/expression_eval";
import { getMemberVertex } from "~/lib/graph/get/sync/user/getMemberVertex";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";

export function getPermissions(meta: Vertex) {
  const permissionResult = [] as [Id[], string][];
  const [graph, _setGraph] = useGraph();

  const roleRows = evalExpression("->$0Role", {
    graph,
    vertexes: [meta],
  });
  if (roleRows) {
    for (const roleRow of roleRows) {
      const roles = evalExpression("->$0Role", {
        graph,
        vertexes: [roleRow],
      });
      if (roles) {
        const allowedRoleIds = new Set<Id>();
        for (const role of roles) {
          if (getMemberVertex(graph).P.roles?.includes(role.id)) {
            allowedRoleIds.add(role.id);
          }
        }
        if (allowedRoleIds.size > 0) {
          const permissionRows = evalExpression("->$0Perm", {
            graph,
            vertexes: [roleRow],
          });
          if (permissionRows) {
            for (const permissionRow of permissionRows) {
              const permissions = evalExpression("->$0Perm", {
                graph,
                vertexes: [permissionRow],
              });
              if (permissions) {
                permissionResult.push([
                  permissions?.map((perm: Vertex) => perm.id),
                  permissionRow.P.scope,
                ]);
              }
            }
          }
        }
      }
    }
  }
  return permissionResult;
}
