import { Title } from "@solidjs/meta";

import { getTitle } from "../lib/graph/get/sync/theme/getTitle";

export function SiteTitle(props: Readonly<{ children: string }>) {
  return <Title>{getTitle(props.children)}</Title>;
}
