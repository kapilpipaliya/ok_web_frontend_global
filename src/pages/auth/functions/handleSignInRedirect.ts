import type { Navigator } from "@solidjs/router";

import { API } from "~/lib/api/endpoints";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

export function handleSignInRedirect(
  value: Vertex,
  _graph: GraphInterface,
  navigate: Navigator,
) {
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get("redirectUrl");
  const fallbackUrl =
    value?.P?.redirectUrl && String(value.P.redirectUrl).startsWith("/")
      ? String(value.P.redirectUrl)
      : API.urls.admin.root;

  const targetUrl =
    redirectUrl && redirectUrl.startsWith("/") ? redirectUrl : fallbackUrl;

  navigate(targetUrl, { replace: true });
}
