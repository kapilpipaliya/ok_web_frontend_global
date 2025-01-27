import type { Navigator } from "@solidjs/router";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

export function handleLoginRedirect(
  value: Vertex,
  graph: GraphInterface,
  navigate: Navigator,
) {
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get("redirectUrl");

  if (redirectUrl) {
    navigate(redirectUrl);
  } else if (value != null && value.id !== null) {
    navigate(`/admin/${value.P.redirectUrl ?? ""}`);
  }
}
