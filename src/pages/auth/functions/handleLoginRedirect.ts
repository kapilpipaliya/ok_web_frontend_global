import type { Navigator } from "@solidjs/router";

import type { Vertex } from "~/lib/graph/graph";
import type { GraphInterface } from "~/lib/graph/GraphContext";

export function handleLoginRedirect(
  value: Vertex,
  _graph: GraphInterface,
  navigate: Navigator,
) {
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get("redirectUrl");

  if (redirectUrl) {
    navigate(redirectUrl);
  } else if (value != null && value.id !== null) {
    navigate(`${value.P.redirectUrl ?? ""}`);
  }
}
