import { createMemo } from "solid-js";

import type { GraphInterface } from "~/lib/graph/graph";

import { getGlobalSettingVertex } from "~/lib/graph/get/sync/theme/getGlobalThemeVertex";
import { APP_NAME, APP_VERSION } from "~/pages/settings/constants";

export function getTitle(title: string, graph?: GraphInterface) {
  const appName = () =>
    graph ? getGlobalSettingVertex(graph)?.P.appName || APP_NAME : APP_NAME;

  return `${title.trim()} | ${appName()} v${APP_VERSION}`;
}
