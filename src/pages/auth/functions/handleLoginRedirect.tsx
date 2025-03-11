import type { UseNavigateResult } from "@tanstack/solid-router";

import type { GraphInterface, Vertex } from "~/lib/graph/graph";

export function handleLoginRedirect(
  value: Vertex,
  _graph: GraphInterface,
  navigate: UseNavigateResult<string>,
) {
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get("redirectUrl");

  if (redirectUrl) {
    navigate({ to: redirectUrl });
  } else if (value != null && value.id !== null) {
    navigate({ to: `${value.P.redirectUrl ?? ""}` });
  }
}
