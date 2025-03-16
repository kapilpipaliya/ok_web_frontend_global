import { createAsync, useLocation, useNavigate } from "@solidjs/router";
import { type JSX, Show } from "solid-js";

import { API } from "~/lib/api/endpoints";

import { checkRoutePermission } from "../checkRoutePermissionRPC";

/**
 * Example of using the common permission check function in a component
 * This component checks if the user has permission to access a specific path
 * and renders content accordingly
 */
export function PermissionGuard(props: {
  children: JSX.Element;
  fallback?: JSX.Element;
  path?: string;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // Path to check - use provided path or current location
  const pathToCheck = () => props.path || location.pathname;

  // Create a resource to check permissions
  const permissionResult = createAsync(async () => {
    // Check if the user has permission to access this path
    return await checkRoutePermission(undefined, pathToCheck());
  });

  // Handle unauthorized access
  const handleUnauthorized = () => {
    if (permissionResult()?.redirectUrl) {
      navigate(permissionResult()?.redirectUrl || API.urls.admin.login);
    }
  };

  return (
    <Show
      fallback={
        <div>
          {props.fallback || (
            <div class="unauthorized-message">
              <h3>Access Denied</h3>
              <p>
                {permissionResult()?.message ||
                  "You don't have permission to access this content"}
              </p>
              <button onClick={handleUnauthorized}>Go to login</button>
            </div>
          )}
        </div>
      }
      when={permissionResult()?.hasPermission}
    >
      {props.children}
    </Show>
  );
}
