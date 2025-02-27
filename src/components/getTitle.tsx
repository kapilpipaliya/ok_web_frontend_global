import { createMemo } from "solid-js";

import type { GraphInterface } from "~/lib/graph/graph";

import { APP_NAME, APP_VERSION } from "~/constants/version";
import { getGlobalSettingVertex } from "~/lib/graph/get/sync/getGlobalThemeVertex";

export function getTitle(title: string, graph: GraphInterface) {
  const appName = createMemo(() =>
    graph ? getGlobalSettingVertex(graph)?.P.appName || APP_NAME : APP_NAME,
  );

  return `${title.trim()} | ${appName()} v${APP_VERSION}`;
}
