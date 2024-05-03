import {graph, Id, Node} from "./graph";
import {getChildVertexes} from "./Traverse";

export async function getPermissions(meta: Node) {
    const permissionResult = [] as [Id[], string][];
    const roleRows = getChildVertexes(['$0Role'], [meta]);
    if (!roleRows.error) {
        for (const roleRow of roleRows.vertexes!) {
            const roles = getChildVertexes(['$0Role'], [roleRow]);
            if (!roles.error) {
                const allowedRoleIds = new Set<number>();
                for (const role of roles.vertexes!) {
                    if (graph.member && graph.member.P.roles?.includes(role.id)) {
                        allowedRoleIds.add(role.id);
                    }
                }
                if (allowedRoleIds.size > 0) {
                    const permissionRows = getChildVertexes(['$0Perm'], [roleRow]);
                    if (!permissionRows.error) {
                        for  (const permissionRow of permissionRows.vertexes!) {
                            const permissions = getChildVertexes(["$0Perm"], [permissionRow]);
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
