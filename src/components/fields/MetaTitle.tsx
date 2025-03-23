import { Link, Meta, Title } from "@solidjs/meta";
import { JSX, splitProps } from "solid-js";

import { getTitle } from "~/lib/graph/get/sync/theme/getTitle";
import { useGraph } from "~/lib/graph/GraphContext";

export function MetaLink(props: { children: JSX.Element; href: string }) {
  const [, others] = splitProps(props, ["children"]);
  return <Link {...others}/>;
}

export function MetaMeta(props: { children: JSX.Element; content: string; name: string, }) {
  const [, others] = splitProps(props, ["children"]);
  return <Meta {...others} />;
}

export function MetaTitle(props: { text: string }) {
  const [graph] = useGraph();
  return <Title>{getTitle(props.text || "", graph)}</Title>;
}
