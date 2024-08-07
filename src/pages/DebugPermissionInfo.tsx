import type { Vertex } from "~/lib/graph/graph";

export function DebugPermissionInfo(
  props: Readonly<{
    allConfiguredPermission: Vertex[];
    authError: string;
    hasDeletePermission: boolean;
    hasEditPermission: boolean;
    hasInsertPermission: boolean;
    hasViewPermission: boolean;
    isNoPermissionCheck: boolean;
    metaVertexId?: string;
    mounted: boolean;
    userRoles: string[];
  }>,
) {
  return (
    <div>
      <p>User Roles: {JSON.stringify(props.userRoles)}</p>
      <p>
        allConfiguredPermission: {JSON.stringify(props.allConfiguredPermission)}
      </p>
      <p>hasInsertPermission: {props.hasInsertPermission.toString()}</p>
      <p>hasEditPermission: {props.hasEditPermission.toString()}</p>
      <p>hasViewPermission: {props.hasViewPermission.toString()}</p>
      <p>hasDeletePermission: {props.hasDeletePermission.toString()}</p>
      <p>mounted: {props.mounted.toString()}</p>
      <p>authError: {props.authError}</p>
      <p>metaVertex: {props.metaVertexId}</p>
      <p>isNoPermissionCheck: {props.isNoPermissionCheck?.toString()}</p>
    </div>
  );
}
