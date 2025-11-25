import { createAsync, useLocation, useNavigate } from "@solidjs/router";
import { type ParentProps, Show } from "solid-js";

import { API } from "~/lib/api/endpoints";
import { getUserRPC } from "~/routes/api/auth/(user)/getUserRPC";
import { Loader } from "~/components/Loader";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import { setUserData } from "~/lib/graph/mutate/user/setUserData";
import { handleUserNavigation } from "~/lib/graph/mutate/user/loadUser";
import type { UserData } from "~/lib/graph/mutate/user/loadUser";
import type { APIErrorResponse } from "~/lib/api/server/apiErrorHandler";

/**
 * A component that checks if the user is authenticated.
 * If not, it redirects to the login page with the current path as redirectUrl.
 * Otherwise, it renders its children.
 */
export function AuthRequired(props: ParentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const graph = useGraph();

  const setData = (userData?: UserData | APIErrorResponse | null) => {
    if (!userData) {
      return;
    }

    // Check if userData is an error response
    if ("error" in userData) {
      // Handle API error - redirect to login
      console.error("Failed to load user data:", userData.error);
      const params = new URLSearchParams(location.search);
      params.set("redirectUrl", location.pathname);
      navigate(`${API.urls.admin.signIn}?${params.toString()}`, {
        replace: true,
      });
      return;
    }

    // First, set the graph with IN/OUT relationships
    if (userData.graph) {
      setGraphData(graph[0], graph[1], userData.graph);
    }

    // Then, set user IDs in global store
    setUserData(graph[0], graph[1], userData);

    // Handle user navigation
    handleUserNavigation(userData, navigate);
  };

  const authData = createAsync(
    async () => {
      try {
        const userData = await getUserRPC();
        if (userData.error || !userData?.user) {
          const params = new URLSearchParams(location.search);
          params.set("redirectUrl", location.pathname);
          navigate(`${API.urls.admin.signIn}?${params.toString()}`, {
            replace: true,
          });
          return null;
        }
        return userData;
      } catch (_error) {
        const params = new URLSearchParams(location.search);
        params.set("redirectUrl", location.pathname);
        navigate(`${API.urls.admin.signIn}?${params.toString()}`, {
          replace: true,
        });
        return null;
      }
    },
    { deferStream: true },
  );

  const RenderContent = () => {
    setData(authData());
    return props.children;
  };

  return (
    <Show
      when={authData()}
      fallback={<Loader message="Checking authentication..." />}
    >
      <RenderContent />
    </Show>
  );
}
