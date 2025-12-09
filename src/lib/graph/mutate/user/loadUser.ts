import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphData } from "~/cypher/types/ServerResult";
import { API } from "~/lib/api/endpoints";
import { useLocation, useNavigate } from "@solidjs/router";

// Type for the user data response
export interface UserData {
  profileImage?: Vertex | null;
  roles?: Vertex[];
  user?: Vertex | null;
  userSetting?: Vertex | null;
  globalSetting?: Vertex | null;
  graph?: GraphData;
}

// Function to handle navigation after user data fetch
export function handleUserNavigation(
  userData: null | UserData,
  navigate?: ReturnType<typeof useNavigate>,
  location?: ReturnType<typeof useLocation>,
) {
  if (!userData?.user) {
    // TODO: add support for redirect to same page after signIn
    if (location && navigate) { 
    const params = new URLSearchParams(location.search);
    params.set("redirectUrl", location.pathname);
      navigate(`${API.urls.admin.signIn}?${params.toString()}`, {
        replace: true,
      });
    }
    return false;
  }
  return true;
}
