import { Link, Meta, Title, Base, Style } from "@solidjs/meta";
import { type JSX, splitProps, Show } from "solid-js";

import { getTitle } from "~/lib/graph/get/sync/theme/getTitle";
import { useGraph } from "~/lib/graph/GraphContext";

export function MetaLink(props: { children: JSX.Element; href: string }) {
  const [, others] = splitProps(props, ["children"]);
  return <Link {...others} />;
}

export function MetaMeta(props: {
  children: JSX.Element;
  content: string;
  name: string;
}) {
  const [, others] = splitProps(props, ["children"]);
  return <Meta {...others} />;
}

export function MetaTitle(props: { text: string }) {
  const [graph] = useGraph();
  return <Title>{getTitle(props.text || "", graph)}</Title>;
}

type HeadProps = {
  type: "base" | "link" | "meta" | "style" | "title";
  props: {
    [key: string]: string | number | boolean | undefined;
  };
  text?: string;
};

export function Head(props: HeadProps) {
  const [local, others] = splitProps(props, ["type", "text"]);
  // instead of children, used text in style and title
  
  return (
    <>
      <Show when={local.type === "base"}>
        <Base {...others} />
      </Show>
      
      <Show when={local.type === "link"}>
        <Link {...others} />
      </Show>
      
      <Show when={local.type === "meta"}>
        <Meta {...others} />
      </Show>
      
      <Show when={local.type === "style"}>
        <Style>{local.text}</Style>
      </Show>
      
      <Show when={local.type === "title"}>
        <Title>{local.text}</Title>
      </Show>
    </>
  );
}
