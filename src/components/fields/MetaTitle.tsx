import { Link, Meta, Title } from "@solidjs/meta";

import { getTitle } from "~/lib/graph/get/sync/theme/getTitle";
import { useGraph } from "~/lib/graph/GraphContext";

export function MetaLink(props: { href: string }) {
  return <Link {...props} />;
}

export function MetaMeta(props: { content: string; name: string }) {
  return <Meta {...props} />;
}

export function MetaTitle(props: { text: string }) {
  const [graph] = useGraph();
  return <Title>{getTitle(props.text || "", graph)}</Title>;
}
