import type { SetStoreFunction, Store } from "solid-js/store";

import { Icon } from "@iconify-icon/solid";
import { A } from "@solidjs/router";
import { type JSXElement, Match, Show, Switch, createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { GenericComponentProps } from "~/components/fields/ComponentType";

import { Table, TableBodyCell, TableHeadCell } from "~/components/Table";
import { FormWrapper } from "~/components/fields/FormWrapper";
import {
  usePageRenderVertexContext,
  useRepeaterVertexContext,
} from "~/components/page_attr_render/Context";
import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import { Repeater } from "~/components/page_attr_render/Repeater";
import { getDataVertex } from "~/components/page_attr_render/utils/getDataVertex";
import { getLastItem } from "~/components/page_attr_render/utils/getLastItem";
import { PageDesignerLabels } from "~/components/page_designer/functions/constant";
import { Collapsible } from "~/components/solid_blocks/Collapsible";
import { Heading } from "~/components/solid_blocks/Heading";
import { StarRating } from "~/components/solid_blocks/Rating";
import { TreeView } from "~/components/solid_blocks/TreeView";
import { Accordion } from "~/components/solid_blocks/accordion/accordion";
import { Select } from "~/components/solid_blocks/select/select";
import { Tabs } from "~/components/solid_blocks/tabs/tabs";
import { APP_BASE_URL } from "~/lib/constants";
import { getCompFallbackToString } from "~/lib/graph/get/sync/getCompFallbackToString";
import { getSelectionOptions } from "~/lib/graph/get/sync/getSelectionOptions";
import { getViewValue } from "~/lib/graph/get/sync/getViewValue";
import {
  type GraphInterface,
  IdAttr,
  type Vertex,
  useGraph,
} from "~/lib/graph/graph";
import { deNullify } from "~/lib/utils";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

import { mergeCSS } from "../css_properties/utils/mergeCSS";
import { Label } from "../solid_blocks/Label";
import { Avatar } from "../solid_blocks/avatar/avatar";

// This componentName support rendering Child Themselves by calling PageRender.
function getAttrs(meta: Vertex) {
  return meta.P.attr ? JSON.parse(meta.P.attr) : {};
}

export function getText(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  projection: string,
  repeaterContext: Vertex[],
) {
  return (
    (getSelectionOptions(graph, setGraph, projection, repeaterContext)
      .vertexes as string) || projection
  );
}

export function getUrl(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  projection: string,
  repeaterContext: Vertex[],
) {
  const url = getSelectionOptions(graph, setGraph, projection, repeaterContext)
    .vertexes as string | undefined;
  return typeof url === "string" && url.startsWith("/") ? url : undefined;
}

export function GenericField(
  props: {
    [key: string]: any;
    children?: JSXElement;
    componentName?: string;
    disabled?: boolean;
    txnId?: number;
  } & GenericComponentProps,
) {
  const [graph, setGraph] = useGraph();
  const parentItems = usePageRenderVertexContext();
  const componentName = createMemo(
    () => props.componentName ?? props.componentName ?? props.meta.P.componentName,
  );
  const parentComponent = createMemo(
    () =>
      getCompFallbackToString(getLastItem(parentItems, 2), graph)?.P[IdAttr],
  );
  const repeaterContext = useRepeaterVertexContext();

  return (
    <Show
      fallback={getViewValue(props.data?.P[props.meta.P[IdAttr]])}
      // when={!props.disabled}
      when={true}
    >
      <Switch>
        <Match when={componentName() === "Repeater"}>
          <Repeater data={props.data} disabled={props.disabled} meta={props.meta} />
        </Match>
        <Match when={componentName() === "Text" && props.meta.P.as}>
          <Dynamic class={props.meta.P.class} component={props.meta.P.as} disabled={props.disabled}>
            {getText(graph, setGraph, props.meta.P.text, repeaterContext)}
            {props.children}
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </Dynamic>
        </Match>
        <Match when={componentName() === "Text" && !props.meta.P.as}>
          {getText(graph, setGraph, props.meta.P.text, repeaterContext)}
        </Match>
        <Match when={componentName() === "A"}>
          <Switch>
            <Match when={getDataVertex(graph, props.meta)}>
              {(vertex) => (
                <A
                  {...deNullify(props.meta.P)}
                  class={mergeCSS("", props.meta.P.class)}
                  disabled={props.disabled}
                  draggable
                  href={`${APP_BASE_URL}/${vertex().P.name}`}
                >
                  <Show
                    fallback={getText(
                      graph,
                      setGraph,
                      props.meta.P.text,
                      repeaterContext,
                    )}
                    when={!props.meta.P.text}
                  >
                    {props.children}
                    <PageAttrRender data={props.data} metaVertex={props.meta} />
                  </Show>
                </A>
              )}
            </Match>
            <Match when={props.meta.P.href}>
              <A
                {...deNullify(props.meta.P)}
                class={mergeCSS("", props.meta.P.class)}
                disabled={props.disabled}
                draggable
                href={
                  getUrl(graph, setGraph, props.meta.P.href, repeaterContext) ||
                  "#"
                }
              >
                <Show
                  fallback={getText(
                    graph,
                    setGraph,
                    props.meta.P.text,
                    repeaterContext,
                  )}
                  when={!props.meta.P.text}
                >
                  {props.children}
                  <PageAttrRender data={props.data} metaVertex={props.meta} />
                </Show>
              </A>
            </Match>
            <Match when={true}>
              <a disabled={props.disabled} draggable>
                {props.children}
                <PageAttrRender data={props.data} metaVertex={props.meta} />
              </a>
            </Match>
          </Switch>
        </Match>
        <Match
          when={PageDesignerLabels.filter((label) => label !== "Form").includes(
            componentName(),
          )}
        >
          <PageViewWrapper
            disabled={props.disabled}
            expression={props.meta.P.data}
            pageVertexLabel={componentName()}
          />
        </Match>
        <Match when={componentName() === "Image"}>
          <img
            loading="lazy"
            {...deNullify(props.meta.P)}
            alt={"img"}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
            draggable={true}
            src={getText(graph, setGraph, props.meta.P.src, repeaterContext)}
          />
        </Match>
        <Match when={componentName() === "Tabs"}>
          <Tabs
            {...deNullify(props.meta.P)}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
          >
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </Tabs>
        </Match>
        <Match when={componentName() === "TabContainer"}>
          <PageAttrRender data={props.data} disabled={props.disabled} metaVertex={props.meta} />
        </Match>
        <Match when={componentName() === "TabList"}>
          <PageAttrRender data={props.data} disabled={props.disabled} metaVertex={props.meta} />
        </Match>
        <Match when={componentName() === "Icon"}>
          <Icon
            height={props.meta.P.height || "24"}
            icon={props.meta.P.icon}
            width={props.meta.P.width || "24"}
            {...deNullify(props.meta.P)}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
          />
        </Match>
        <Match when={componentName() === "Box" && props.meta.P.text}>
          <Dynamic
            component={props.meta.P.as || "div"}
            {...deNullify(props.meta.P)}
            class={mergeCSS("", props.meta.P.class)}
            {...getAttrs(props.meta)}
            disabled={props.disabled}
          >
            {getText(graph, setGraph, props.meta.P.text, repeaterContext)}
          </Dynamic>
        </Match>
        <Match when={componentName() === "Button"}>
          <button
            {...deNullify(props.meta.P)}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
          >
            <Switch>
              <Match
                when={
                  props.data?.P?.[props.meta.P.name] ??
                  props.meta.P.text ??
                  props.meta.P.children
                }
              >
                {props.data?.P?.[props.meta.P.name] ??
                  props.meta.P.text ??
                  props.meta.P.children}
              </Match>
              <Match when={true}>
                <PageAttrRender data={props.data} metaVertex={props.meta} />
              </Match>
            </Switch>
          </button>
        </Match>
        <Match when={componentName() === "Table"}>
          <Table
            headers={
              getSelectionOptions(graph, setGraph, "->Attr", [props.meta])
                .vertexes?.length || 0
            }
            {...deNullify(props.meta.P)}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
          >
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </Table>
        </Match>
        <Match
          when={
            componentName() === "TableHeader" &&
            getSelectionOptions(graph, setGraph, "->Attr", [props.meta])
              .vertexes?.length
          }
        >
          <TableHeadCell class={"h:5 p:10 text:center"} disabled={props.disabled}>
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </TableHeadCell>
        </Match>
        <Match when={componentName() === "TableRow"}>
          <TableBodyCell class={"b:1px|solid|#000 bg:#ffffff h:50 text:center"} disabled={props.disabled}>
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </TableBodyCell>
        </Match>
        <Match when={componentName() === "Collapsible"}>
          <Collapsible
            isOpen={props.meta.P.isOpen ?? true}
            {...deNullify(props.meta.P)}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
          >
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </Collapsible>
        </Match>
        <Match when={componentName() === "Avtar"}>
          <Avatar
            {...deNullify(props.meta.P)}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
          >
            {props.data?.P[props.meta.P[IdAttr]] ?? props.meta.P.children}
          </Avatar>
        </Match>
        <Match when={componentName() === "Select"}>
          <Select
            {...deNullify(props.meta.P)}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
          >
            {props.data?.P[props.meta.P[IdAttr]] ?? props.meta.P.children}
          </Select>
        </Match>
        <Match when={componentName() === "TreeViewItem"}>
          <TreeView disabled={props.disabled} meta={props.meta} title={props.meta.P?.title ?? "MenuItem"}>
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </TreeView>
        </Match>
        <Match when={componentName() === "TreeViewChild"}>
          <PageAttrRender data={props.data} disabled={props.disabled} metaVertex={props.meta} />
        </Match>
        <Match when={componentName() === "Accordion"}>
          <Accordion
            {...deNullify(props.meta.P)}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
          >
            {props.data?.P[props.meta.P[IdAttr]] ?? props.meta.P.children}
          </Accordion>
        </Match>
        <Match when={componentName() === "Breadcrumb"}>
          <Breadcrumbs
            aria-label="breadcrumb"
            // @ts-ignore
            separator={props.meta.P.separator ?? "›"}
            {...deNullify(props.meta.P)}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
          >
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </Breadcrumbs>
        </Match>
        <Match when={componentName() === "Form" || componentName() === "Step"}>
          <FormWrapper disabled={props.disabled} meta={props.meta} />
        </Match>
        <Match when={componentName() === "Divider"}>
          <hr
            {...deNullify(props.meta.P)}
            class={` ${mergeCSS("", props.meta.P.class)} color:${props.meta.P.color ?? "lightgrey"} h:${props.meta.P.height ?? "2"} w:full`}
            disabled={props.disabled}
          />
        </Match>
        <Match when={componentName() === "Heading"}>
          <Heading
            {...deNullify(props.meta.P)}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
            divider={props.meta.P.divider ?? true}
            etc={props.meta.P.class}
            heading={props.meta.P.heading}
            subheading={props.meta.P.subheading}
          />
        </Match>
        <Match when={componentName() === "Rating"}>
          <StarRating
            {...deNullify(props.meta.P)}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
            etc={props.meta.P.class}
            heading={props.meta.P.heading ?? "Rating"}
          />
        </Match>
        <Match when={componentName() === "Label"}>
          <Label
            meta={props.meta}
            {...deNullify(props.meta.P)}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
          >
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </Label>
        </Match>
        <Match when={true}>
          <Dynamic
            component={props.meta.P.as || "div"}
            {...deNullify(props.meta.P)}
            {...getAttrs(props.meta)}
            class={mergeCSS("", props.meta.P.class)}
            disabled={props.disabled}
          >
            {props.children}
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </Dynamic>
        </Match>
      </Switch>
    </Show>
  );
}
