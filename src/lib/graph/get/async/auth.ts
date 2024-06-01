import { GraphContext, type Id, type Vertex } from "~/lib/graph/graph";
import { getChildVertexesAsync } from "./traverse";
import { useContext } from "solid-js";

export async function getPermissionsAsync(meta: Vertex) {
  const permissionResult = [] as [Id[], string][];
  const [graph, setGraph] = useContext(GraphContext)!;

  const roleRows = await getChildVertexesAsync(graph, ["$0Role"], [meta]);
  if (!roleRows.error) {
    for (const roleRow of roleRows.vertexes!) {
      const roles = await getChildVertexesAsync(graph, ["$0Role"], [roleRow]);
      if (!roles.error) {
        const allowedRoleIds = new Set<number>();
        for (const role of roles.vertexes!) {
          if (graph.member && graph.member.P.roles?.includes(role.id)) {
            allowedRoleIds.add(role.id);
          }
        }
        if (allowedRoleIds.size > 0) {
          const permissionRows = await getChildVertexesAsync(
            graph,
            ["$0Perm"],
            [roleRow],
          );
          if (!permissionRows.error) {
            for (const permissionRow of permissionRows.vertexes!) {
              const permissions = await getChildVertexesAsync(
                graph,
                ["$0Perm"],
                [permissionRow],
              );
              if (!permissions.error) {
                permissionResult.push([
                  permissions.vertexes!.map((perm) => perm.id),
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
