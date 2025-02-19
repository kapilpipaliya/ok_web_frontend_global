import { type JSX, Match, Show, splitProps, Switch } from "solid-js";
import { Dynamic } from "solid-js/web";

import { replacePlaceholderWithUrl } from "~/features/css_editor/utils/cssStateToString";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { useGraph } from "~/lib/graph/graph";

import type { GenericComponentProps } from "./FieldType";

// HtmlField
export function HtmlField(
  props: JSX.HTMLAttributes<HTMLDivElement> &
    Readonly<GenericComponentProps> & {
      as?: string;
      childrenBefore?: JSX.Element;
      class?: string;
      isViewMode?: boolean;
      longPressDuration?: number;
      onLongPress?: (event: Event) => void;
      src?: string;
      text?: string;
      viewModeClass?: string;
    },
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
    "src",
  ]);

  const Content = () => {
    return (
      <>
        <Show when={local.childrenBefore}>{local.childrenBefore}</Show>
        {local.text}
        {local.value}
        <Show when={!local.childrenBefore}>{local.children}</Show>
      </>
    );
  };

  return (
    <Switch>
      <Match when={!local.as}>
        <Content />
      </Match>
      <Match when={local.as === "img"}>
        <img
          class={`${local.isViewMode ? local.viewModeClass : local.class || ""}`}
          loading="lazy"
          {...(others as JSX.ImgHTMLAttributes<HTMLImageElement>)}
          src={replacePlaceholderWithUrl(
            local.src ?? "",
            "$0Src",
            meta(),
            graph,
          )}
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
