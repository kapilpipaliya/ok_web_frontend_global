import { type JSX, Show, mergeProps, splitProps } from "solid-js";

import { getRandom } from "../tools";
import "./tag.css";

export type TagProps = { plain?: boolean } & (JSX.HTMLAttributes<HTMLSpanElement> &
  Partial<JSX.AnchorHTMLAttributes<HTMLAnchorElement>>);

export function Tag(props: TagProps) {
  const [local, tagProps] = splitProps(props, ["plain"]);
  const mergedProps = mergeProps(
    {
      "data-random": local.plain ? undefined : getRandom(),
      rel: props.target ? "tag noopener" : "tag",
    },
    tagProps,
    { class: props.class ? `sb-tag ${props.class}` : "sb-tag" },
  );
  return (
    <Show
      fallback={<span {...mergedProps} />}
      when={typeof mergedProps.href === "string"}
    >
      <a {...mergedProps} />
    </Show>
  );
}

export type TagGroupProps = JSX.HTMLAttributes<HTMLDivElement>;

export function TagGroup(props: TagGroupProps) {
  return (
    <div
      {...props}
      class={props.class ? `sb-tag-group ${props.class}` : "sb-tag-group"}
    />
  );
}
