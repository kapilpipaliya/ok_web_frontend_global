import {GraphContext, Id, Vertex} from "./graph";
import { getChildVertexes } from "./Utils";
import {useContext} from "solid-js";

export function getPermissions(meta: Vertex) {
    const permissionResult = [] as [Id[], string][];
    const [graph,setGraph] = useContext(GraphContext)!;

    const roleRows = getChildVertexes(graph, ["$0Role"], [meta]);
    if (!roleRows.error) {
        for (const roleRow of roleRows.vertexes!) {
            const roles = getChildVertexes(graph, ["$0Role"], [roleRow]);
            if (!roles.error) {
                const allowedRoleIds = new Set<number>();
                for (const role of roles.vertexes!) {
                    if (graph.member && graph.member.P.roles?.includes(role.id)) {
                        allowedRoleIds.add(role.id);
                    }
                }
                if (allowedRoleIds.size > 0) {
                    const permissionRows = getChildVertexes(
                      graph,
                      ["$0Perm"],
                      [roleRow]
                    );
                    if (!permissionRows.error) {
                        for  (const permissionRow of permissionRows.vertexes!) {
                            const permissions = getChildVertexes(
                              graph,
                              ["$0Perm"],
                              [permissionRow]
                            );
                            if (!permissions.error) {
                                permissionResult.push([permissions.vertexes!.map(perm => perm.id), permissionRow.P.scope])
                            }
                        }
                    }
                }
            }
        }
    }
    return permissionResult;
}
