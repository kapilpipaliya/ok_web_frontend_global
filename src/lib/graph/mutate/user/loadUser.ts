import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphData } from "~/cypher/types/ServerResult";
import { API } from "~/lib/api/endpoints";

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
  navigate?: (path: string) => void,
) {
  if (!userData?.user) {
    // TODO: add support for redirect to same page after signIn
    navigate?.(API.urls.admin.signIn);
    return false;
  }
  return true;
}
