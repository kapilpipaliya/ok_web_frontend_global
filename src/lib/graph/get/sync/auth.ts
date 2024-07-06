import { useContext } from "solid-js";

import { GraphContext, type Id, type Vertex } from "~/lib/graph/graph";

import { getSelectionOptions } from "./traverse";

export function getPermissions(meta: Vertex) {
  const permissionResult = [] as [Id[], string][];
  const [graph, setGraph] = useContext(GraphContext)!;

  const roleRows = getSelectionOptions(graph, setGraph, "->$0Role", [meta]);
  if (!roleRows.error) {
    for (const roleRow of roleRows.vertexes!) {
      const roles = getSelectionOptions(graph, setGraph, "->$0Role", [roleRow]);
      if (!roles.error) {
        const allowedRoleIds = new Set<Id>();
        for (const role of roles.vertexes!) {
          if (graph.member?.P.roles?.includes(role.id)) {
            allowedRoleIds.add(role.id);
          }
        }
        if (allowedRoleIds.size > 0) {
          const permissionRows = getSelectionOptions(graph, setGraph, "->$0Perm", [roleRow]);
          if (!permissionRows.error) {
            for (const permissionRow of permissionRows.vertexes!) {
              const permissions = getSelectionOptions(
                graph,
                setGraph,
                "->$0Perm",
                [permissionRow],
              );
              if (!permissions.error) {
                permissionResult.push([
                  permissions.vertexes?.map((perm) => perm.id),
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
