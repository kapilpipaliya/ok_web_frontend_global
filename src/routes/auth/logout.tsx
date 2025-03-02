import { useNavigate } from "@solidjs/router";
import { onMount } from "solid-js";

import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/postApi";
import { useGraph } from "~/lib/graph/graph";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex";

export default function Logout() {
  const navigate = useNavigate();
  const [graph, setGraph] = useGraph();

  onMount(async () => {
    try {
      // Call the logout API endpoint
      await postAPI(API.auth.logOutUrl, {});
      
      // Delete member vertex from the graph
      deleteVertex(0, "member", graph, setGraph);
      
      // Navigate to login page with replaced history
      navigate(API.urls.admin.login, { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if there's an error, navigate to login
      navigate(API.urls.admin.login, { replace: true });
    }
  });

  // Return empty component since we're just handling the redirect
  return <div>Logging out...</div>;
} 