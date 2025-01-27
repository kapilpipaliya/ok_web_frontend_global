import { type JSX, Match, Show, splitProps, Switch } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createLongPress } from "~/lib/hooks/createLongPress";

import type { GenericComponentProps } from "./FieldType";
import { replacePlaceholderWithUrl } from "../css_properties/utils/cssStateToString";
import { useGraph } from "~/lib/graph/graph";
import { usePageRenderContext } from "../page_attr_render/context/PageRenderContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";

// HtmlField
export function BoxField(
  props: {
    as?: string;
    class?: string;
    isViewMode?: boolean;
    longPressDuration?: number;
    onLongPress?: (event: Event) => void;
    viewModeClass?: string;
    text?: string;
    childrenBefore?: JSX.Element;
    src?: string;
  } & JSX.HTMLAttributes<HTMLDivElement> &
    Readonly<GenericComponentProps>,
) {
  const [graph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta!;
  const [local, others] = splitProps(props, [
    "componentName",
    "onChange",
    "value",
    "as",
    "class",
    "isViewMode",
    "viewModeClass",
    "children",
    "text",
    "childrenBefore",
    "src"
  ]);


  const Content = () => {
    return <>
      <Show when={local.childrenBefore}>{local.childrenBefore}</Show>
      {local.text}
      {local.value}
      <Show when={!local.childrenBefore}>{local.children}</Show>
    </>
  }

  return (
    <Switch>
      <Match when={!local.as}>
        <Content />
      </Match>
      <Match when={local.as === "img"}>
        <img
          loading="lazy"
          {...others as JSX.ImgHTMLAttributes<HTMLImageElement>}
          src={replacePlaceholderWithUrl(local.src ?? "", "$0Src", meta(), graph)}
        />
      </Match>
      <Match when={true}>
        <Dynamic
          class={`${local.isViewMode ? local.viewModeClass : local.class || ""}`}
          component={local.as || "div"}
          {...others}
        >
          <Content />
        </Dynamic>
      </Match>
    </Switch>
  );
}
