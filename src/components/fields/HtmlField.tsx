import { type JSX, Match, Show, splitProps, Switch } from "solid-js";
import { Dynamic } from "solid-js/web";

import { replacePlaceholderWithUrl } from "~/features/css_editor/utils/cssStateToString";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import {
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { setPropertyValueGlobal } from "~/features/page_designer/functions/setPropertyValueGlobal";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { useGraph, type Vertex } from "~/lib/graph/graph";

import type { FormStoreObject } from "../form/context/FormContext";
import type { GenericComponentProps } from "./type/FieldType";

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
  const [graph, setGraph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta!;
  const layoutStoreId = useDesignerLayoutStore();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
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

  const handleTextChange = (e: Event) => {
    if (!layoutStoreId) {
      return;
    }

    const target = e.target as HTMLSpanElement;
    if (formStoreVertex()?.P.selectedId !== -1) {
      setPropertyValueGlobal(
        graph,
        setGraph,
        formStoreVertex()?.P.txnId,
        {
          P: {
            key: "text",
          },
        } as unknown as Vertex,
        meta(),
        target.textContent,
      );
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLElement).blur();
      handleTextChange(e);
    }
  };

  const Content = () => {
    const isPageDesigner = !!layoutStoreId;

    return (
      <Switch>
        <Match when={isPageDesigner && local.text}>
          <Show when={local.childrenBefore}>{local.childrenBefore}</Show>
          <span
            contentEditable={true}
            onBlur={handleTextChange}
            onKeyDown={handleKeyDown}
            style={{ display: "inline-block", "min-width": "1em" }}
          >
            {local.text}
          </span>
          <Show when={!local.childrenBefore}>{local.children}</Show>
        </Match>
        <Match when={true}>
          <Show when={local.childrenBefore}>{local.childrenBefore}</Show>
          {local.text}
          <Show when={!local.childrenBefore}>{local.children}</Show>
        </Match>
      </Switch>
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
