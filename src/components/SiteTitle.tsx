import { Title } from "@solidjs/meta";

import { getTitle } from "./getTitle";

export function SiteTitle(props: Readonly<{ children: string }>) {
  return <Title>{getTitle(props.children)}</Title>;
}
