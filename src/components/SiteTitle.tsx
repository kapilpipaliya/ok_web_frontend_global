import { Title } from "@solidjs/meta";
import { createMemo } from "solid-js";

import { APP_VERSION } from "~/constants/version";
import { getGlobalSettingVertex } from "~/lib/graph/get/sync/getGlobalThemeVertex";
import { useGraph } from "~/lib/graph/graph";

// TODO: Should get from the global state
export function SiteTitle(props: Readonly<{ children: string }>) {
  const [graph] = useGraph();
  const appName = createMemo(
    () => getGlobalSettingVertex(graph)?.P.appName || "EasyFormForge",
  );

  return (
    <Title>{`${props.children.trim()} | ${appName()} v${APP_VERSION}`}</Title>
  );
}
