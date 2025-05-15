import { type JSX, Match, Show, splitProps, Switch } from "solid-js";
import { Dynamic, Portal } from "solid-js/web";
import { untrack } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { Link, Meta, Title, Base, Style } from "@solidjs/meta";

import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import {
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { usePreviewContext } from "~/features/page_designer/context/PreviewContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";

import type { FormStoreObject } from "../form/context/FormContext";
import type { GenericComponentProps } from "./type/FieldType";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { evalExpression } from "~/lib/expression_eval";
import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";

export function replacePlaceholderWithUrl(
  value: string,
  edgeName: string,
  data: Vertex,
  graph: GraphInterface,
): string {
  if (!value.includes("$1")) {
    return value;
  }

  const files =
    evalExpression(`->${edgeName}`, {
      graph,
      setGraph: () => {},
      vertexes: [data],
    }) || [];

  if (files.length === 0) {
    return value;
  }

  const file = files[0];
  return value.replaceAll("$1", getDownloadLink(file));
}

// HtmlField
export function HtmlField(
  props: JSX.HTMLAttributes<HTMLDivElement> &
    Readonly<GenericComponentProps> & {
      as?: string;
      childrenBefore?: JSX.Element;
      class?: string;
      longPressDuration?: number;
      onLongPress?: (event: Event) => void;
      src?: string;
      text?: string;
    },
) {
  const [graph, setGraph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta;
  const layoutStoreId = useDesignerLayoutStore();
  const formStoreId = useDesignerFormIdContext();
  const [previewStore] = usePreviewContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const [local, others] = splitProps(props, [
    "as",
    "class",
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
    const txnId = formStoreVertex()?.P.txnId;
    const metaVertex = meta();
    if (
      formStoreVertex()?.P.selectedId !== -1 &&
      target.textContent !== local.text &&
      txnId &&
      metaVertex
    ) {
      untrack(() => {
        mergeVertexProperties(txnId, metaVertex.id, graph, setGraph, {
          text: target.textContent,
        });
      });
      saveUndoPoint(txnId, graph, setGraph);
    }
  };
  const handleKeyDown = (e: KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      !e.ctrlKey &&
      !e.shiftKey &&
      !e.altKey &&
      !e.metaKey
    ) {
      e.preventDefault();
      handleTextChange(e);
      // manually update the text, if changed
      if (local.text !== (e.target as HTMLElement).textContent) {
        (e.target as HTMLElement).textContent = local.text ?? "";
      }
    }
  };

  const Content = () => {
    const TextContent = () => {
      return (
        <Show when={props.text}>
          <Show
            fallback={<span>{local.text}</span>}
            when={previewStore.isDesignMode}
          >
            <span
              contentEditable={true}
              onBlur={handleTextChange}
              onKeyDown={handleKeyDown}
              style={{ display: "inline-block", "min-width": "1em" }}
            >
              {local.text}
            </span>
          </Show>
        </Show>
      );
    };

    return (
      <>
        <Show when={local.childrenBefore}>{local.childrenBefore}</Show>
        <TextContent />
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
          class={`${local.class || ""}`}
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
      <Match when={local.as === "icon"}>
        {/* @ts-expect-error - icon wiil be in others */}
        <Icon class={`${local.class || ""}`} noobserver {...others} />
      </Match>
      <Match when={local.as === "base"}>
        <Base {...others} />
      </Match>

      <Match when={local.as === "link"}>
        <Link {...others} />
      </Match>

      <Match when={local.as === "meta"}>
        <Meta {...others} />
      </Match>

      <Match when={local.as === "style"}>
        <Style>{local.text}</Style>
      </Match>

      <Match when={local.as === "title"}>
        <Title>{local.text}</Title>
      </Match>
      <Match when={local.as === "portal"}>
        <Portal {...others}>
          <Content />
        </Portal>
      </Match>
      <Match when={true}>
        <Dynamic
          class={`${local.class || ""}`}
          component={local.as || "div"}
          {...others}
        >
          <Content />
        </Dynamic>
      </Match>
    </Switch>
  );
}
