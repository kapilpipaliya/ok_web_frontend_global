import type { SetStoreFunction, Store } from "solid-js/store";

import { A } from "@solidjs/router";
import { type JSXElement, Match, Show, Switch, createMemo, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { GenericComponentProps } from "~/components/fields/ComponentType";

import {
  usePageRenderVertexContext,
  useRepeaterVertexContext,
} from "~/components/page_attr_render/Context";
import { getLastItem } from "~/components/page_attr_render/utils/getLastItem";
import { PageDesignerLabels } from "~/components/page_designer/functions/constant";
import { getCompFallbackToString } from "~/lib/graph/get/sync/getCompFallbackToString";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { getViewValue } from "~/lib/graph/get/sync/getViewValue";
import {
  type GraphInterface,
  IdAttr,
  type Vertex,
  useGraph,
} from "~/lib/graph/graph";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

// This componentName support rendering Child Themselves by calling PageRender.
function getAttrs(meta: Vertex) {
  return meta.P.attr ? JSON.parse(meta.P.attr) : {};
}



export function GenericField(props: Readonly<GenericComponentProps>) {
  const [graph] = useGraph();
  const parentItems = usePageRenderVertexContext();
  const [local, others] = splitProps(props, ['componentName', 'meta', 'data', 'setValue', 'value', 'isRealTime', 'isTableInside', 'setValue', 'txnId', 'children']);

  const componentName = createMemo(
    () => local.componentName ?? local.componentName ?? local.meta.P.componentName,
  );

  const parentComponent = createMemo(
    () =>
      getCompFallbackToString(getLastItem(parentItems, 2), graph)?.P[IdAttr],
  );

  return (
    <Show
      fallback={getViewValue(local.value)}
      // when={!local.disabled}
      when={true}
    >
      <Switch>

        <Match when={componentName() === "Text"}>
          <Dynamic component={local.meta.P.as ?? "span"} {...others}>
            {local.meta.P.text}
            {local.children}
          </Dynamic>
        </Match>

        <Match when={componentName() === "A"}>
          <A
            {...others}
            href={local.meta.P.href}
          >
            {local.meta.P.text}
            {local.children}
          </A>
        </Match>

        <Match
          when={PageDesignerLabels.filter((label) => label !== "Form").includes(
            componentName(),
          )}
        >
          <PageViewWrapper
            expression={local.meta.P.data}
            pageVertexLabel={componentName()}
          />
        </Match>

        <Match when={componentName() === "Image"}>
          <img
            loading="lazy"
            {...others}
          />
        </Match>

        <Match when={componentName() === "Box"}>
          <Dynamic
            component={local.meta.P.as || "div"}
            {...others}
            {...getAttrs(local.meta)}
          >
            {local.meta.P.text}
            {local.children}
          </Dynamic>
        </Match>

        <Match when={componentName() === "Button"}>
          <button
            {...others}
          >
            {local.data?.P?.[local.meta.P.name] ??
              local.meta.P.text ??
              local.meta.P.children}
            {local.children}
          </button>
        </Match>

        <Match when={true}>
          <Dynamic
            component={local.meta.P.as || "div"}
            {...others}
            {...getAttrs(local.meta)}
          >
            {local.children}
          </Dynamic>
        </Match>
      </Switch>
    </Show>
  );
}
/*

        <Match when={componentName() === "TabContainer"}>
          <PageAttrRender data={local.data} disabled={local.disabled} metaVertex={local.meta} />
        </Match>
        <Match when={componentName() === "TabList"}>
          <PageAttrRender data={local.data} disabled={local.disabled} metaVertex={local.meta} />
        </Match>
        <Match when={componentName() === "Icon"}>
          <Icon
            height={local.meta.P.height || "24"}
            icon={local.meta.P.icon}
            width={local.meta.P.width || "24"}
            {...deNullify(local.meta.P)}
            class={mergeCSS("", local.meta.P.class)}
            disabled={local.disabled}
          />
        </Match>

        <Match when={componentName() === "Table"}>
          <Table
            headers={
              getSelectionOptions(graph, setGraph, "->Attr", [local.meta])
                .vertexes?.length || 0
            }
            {...deNullify(local.meta.P)}
            class={mergeCSS("", local.meta.P.class)}
            disabled={local.disabled}
          >
            <PageAttrRender data={local.data} metaVertex={local.meta} />
          </Table>
        </Match>
        <Match
          when={
            componentName() === "TableHeader" &&
            getSelectionOptions(graph, setGraph, "->Attr", [local.meta])
              .vertexes?.length
          }
        >
          <TableHeadCell class={"h:5 p:10 text:center"} disabled={local.disabled}>
            <PageAttrRender data={local.data} metaVertex={local.meta} />
          </TableHeadCell>
        </Match>
        <Match when={componentName() === "TableRow"}>
          <TableBodyCell class={"b:1px|solid|#000 bg:#ffffff h:50 text:center"} disabled={local.disabled}>
            <PageAttrRender data={local.data} metaVertex={local.meta} />
          </TableBodyCell>
        </Match>

        <Match when={componentName() === "TreeViewItem"}>
          <TreeView disabled={local.disabled} meta={local.meta} title={local.meta.P?.title ?? "MenuItem"}>
            <PageAttrRender data={local.data} metaVertex={local.meta} />
          </TreeView>
        </Match>
        <Match when={componentName() === "TreeViewChild"}>
          <PageAttrRender data={local.data} disabled={local.disabled} metaVertex={local.meta} />
        </Match>


        <Match when={componentName() === "Divider"}>
          <hr
            {...deNullify(local.meta.P)}
            class={` ${mergeCSS("", local.meta.P.class)} color:${local.meta.P.color ?? "lightgrey"} h:${local.meta.P.height ?? "2"} w:full`}
            disabled={local.disabled}
          />
        </Match>


        <Match when={componentName() === "Label"}>
          <Label
            meta={local.meta}
            {...deNullify(local.meta.P)}
            class={mergeCSS("", local.meta.P.class)}
            disabled={local.disabled}
          >
            <PageAttrRender data={local.data} metaVertex={local.meta} />
          </Label>
        </Match>
*/