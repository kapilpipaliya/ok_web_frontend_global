import type { SetStoreFunction, Store } from "solid-js/store";

import { Icon } from "@iconify-icon/solid";
import { A } from "@solidjs/router";
import { type JSXElement, Match, Show, Switch, createMemo, useContext } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { ComponentProps } from "~/components/fields/ComponentType";

import { Table, TableBodyCell, TableHeadCell } from "~/components/Table";
import { mergeCSS } from "~/components/css_properties/cssUtils";
import { FormWrapper } from "~/components/fields/FormWrapper";
import { PageRenderVertexContext, RepeaterVertexContext } from "~/components/page_attr_render/Context";
import { PageAttrRender, } from "~/components/page_attr_render/PageAttrRender";
import { Repeater } from "~/components/page_attr_render/Repeater";
import { getComponent } from "~/components/page_attr_render/utils/getComponent";
import {
  getDataVertex
} from "~/components/page_attr_render/utils/getDataVertex";
import { getLastItem } from "~/components/page_attr_render/utils/getLastItem";
import {
  Accordion,
  Avatar,
  Breadcrumbs,
  Progress,
  Select,
  Spinner,
  Tabs
} from "~/components/solid_blocks";
import { Collapsible } from "~/components/solid_blocks/Collapsible";
import { Heading } from "~/components/solid_blocks/Heading";
import { StarRating } from "~/components/solid_blocks/Rating";
import { TreeView } from "~/components/solid_blocks/TreeView";
import { APP_BASE_URL } from "~/lib/constants";
import { PageDesignerLabels } from "~/lib/drag_drop/constant";
import { getCompProps } from "~/lib/graph/get/sync/getProps";
import { getViewValue } from "~/lib/graph/get/sync/getViewValue";
import { getChildVertexes, getSelectionOptions } from "~/lib/graph/get/sync/traverse";
import { GraphContext, type GraphInterface, IdAttr, type Vertex } from "~/lib/graph/graph";
import { deNullify } from "~/lib/utils";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

import { Label } from "../solid_blocks/Label";

// This component support rendering Child Themselves by calling PageRender.
function getAttrs(meta: Vertex) {
  return meta.P.attr ? JSON.parse(meta.P.attr) : {};
}

export function getText(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  projection: string,
  repeaterContext: Vertex[]
) {
  return getSelectionOptions(graph, setGraph, repeaterContext, projection)
    .vertexes as string || projection;
}

export function getUrl(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  projection: string,
  repeaterContext: Vertex[]
) {
  const url = getSelectionOptions(graph, setGraph, repeaterContext, projection)
    .vertexes as string | undefined;
  return typeof url === "string" && url.startsWith("/") ? url : undefined;
}

export function GenericField(
  props: {
    [key: string]: any;
    applyDefaults?: boolean;
    children?: JSXElement;
    component?: string; // depricated
    componentName?: string;
    disabled?: boolean;
    txnId?: number;
  } & ComponentProps,
) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const parentItems = useContext(PageRenderVertexContext);
  const component = createMemo(() => props.component ?? props.componentName ?? props.meta.P.component);
  const parentComponent = createMemo(() => getComponent(graph, getLastItem(parentItems, 2))?.P[IdAttr]);
  const repeaterContext = useContext(RepeaterVertexContext);
  const defaultValues = createMemo(() => props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {});

  return (
    <Show
      fallback={getViewValue(props.data?.P[props.meta.P[IdAttr]])}
      when={!props.disabled}
    >
      <Switch>
        <Match when={component() === "Repeater"}>
          <Repeater data={props.data} meta={props.meta} />
        </Match>
        <Match when={component() === "Text"}>
          <Show
            fallback={getText(graph, setGraph, props.meta.P.text, repeaterContext)}
            when={props.meta.P.as}
          >
            <Dynamic class={props.meta.P.class} component={props.meta.P.as}>
              {getText(graph, setGraph, props.meta.P.text, repeaterContext)}
              {props.children}
              <PageAttrRender data={props.data} metaVertex={props.meta} />
            </Dynamic>
          </Show>
        </Match>
        <Match when={component() === "A"}>
          <Switch>
            <Match when={getDataVertex(graph, props.meta)}>
              {(vertex) => (
                <A
                  {...defaultValues()}
                  {...deNullify(props.meta.P)}
                  class={mergeCSS(defaultValues().class, props.meta.P.class)}
                  draggable
                  href={`${APP_BASE_URL}/${vertex().P.name}`}
                >
                  <Show
                    fallback={getText(graph, setGraph, props.meta.P.text, repeaterContext)}
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
                {...defaultValues()}
                {...deNullify(props.meta.P)}
                class={mergeCSS(defaultValues().class, props.meta.P.class)}
                draggable
                href={getUrl(graph, setGraph, props.meta.P.href, repeaterContext) || "#"}
              >
                <Show
                  fallback={getText(graph, setGraph, props.meta.P.text, repeaterContext)}
                  when={!props.meta.P.text}
                >
                  {props.children}
                  <PageAttrRender data={props.data} metaVertex={props.meta} />
                </Show>
              </A>
            </Match>
            <Match when={true}>
              <a draggable>
                {props.children}
                <PageAttrRender data={props.data} metaVertex={props.meta} />
              </a>
            </Match>
          </Switch>
        </Match>
        <Match when={PageDesignerLabels.filter(label => label !== "Form").includes(component())}>
          {/* g:'Page':-'*[P.name="book"]' */}
          {/* <Show when={props.meta.P.data} keyed> */}
           <PageViewWrapper expression={props.meta.P.data} pageVertexLabel={component()} />
          {/* </Show> */}
        </Match>
        <Match when={component() === "Image"}>
          <img
            loading="lazy"
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            alt={"img"}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
            draggable={true}
            src={getText(graph, setGraph, props.meta.P.src, repeaterContext)}
          />
        </Match>
        <Match when={component() === "Tabs"}>
          <Tabs
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
          >
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </Tabs>
        </Match>
        <Match when={component() === "TabContainer"}>
          <PageAttrRender data={props.data} metaVertex={props.meta} />
        </Match>
        <Match when={component() === "TabList"}>
          <PageAttrRender data={props.data} metaVertex={props.meta} />
        </Match>
        <Match when={component() === "Icon"}>
          <Icon
            height={props.meta.P.height || "24"}
            icon={props.meta.P.icon}
            width={props.meta.P.width || "24"}
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
          />
        </Match>
        <Match when={component() === "Box" && props.meta.P.text}>
          <Dynamic
            component={props.meta.P.as || "div"}
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
            {...getAttrs(props.meta)}
          >
            {getText(graph, setGraph, props.meta.P.text, repeaterContext)}
          </Dynamic>
        </Match>
        <Match when={component() === "Button"}>
          <button
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
          >
            <Switch>
              <Match when={props.data?.P?.[props.meta.P.name] ?? props.meta.P.children}>
                {props.data?.P[props.meta.P.name]}
              </Match>
              <Match when={true}>
                <PageAttrRender data={props.data} metaVertex={props.meta} />
              </Match>
            </Switch>
          </button>
        </Match>
        <Match when={component() === "Table"}>
          <Table
            headers={getChildVertexes(graph, ["Attr"], [props.meta]).vertexes?.length || 0}
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
          >
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </Table>
        </Match>
        <Match when={component() === "TableHeader" && getChildVertexes(graph, ["Attr"], [props.meta]).vertexes?.length}>
          <TableHeadCell class={"p:10 text:center h:5"}>
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </TableHeadCell>
        </Match>
        <Match when={component() === "TableRow"}>
          <TableBodyCell class={"h:50 text:center bg:#ffffff b:1px|solid|#000"}>
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </TableBodyCell>
        </Match>
        <Match when={component() === "Collapsible"}>
          <Collapsible
            isOpen={props.meta.P.isOpen ?? true}
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
          >
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </Collapsible>
        </Match>
        <Match when={component() === "Avtar"}>
          <Avatar
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
          >
            {props.data?.P[props.meta.P[IdAttr]] ?? props.meta.P.children}
          </Avatar>
        </Match>
        <Match when={component() === "Select"}>
          <Select
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
          >
            {props.data?.P[props.meta.P[IdAttr]] ?? props.meta.P.children}
          </Select>
        </Match>
        <Match when={component() === "LoadIndicator"}>
          <Spinner
            {...defaultValues()}
            {...props.meta?.P}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
          >
            {props.meta.P.children}
          </Spinner>
        </Match>
        <Match when={component() === "TreeViewItem"}>
          <TreeView meta={props.meta} title={props.meta.P?.title ?? "MenuItem"}>
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </TreeView>
        </Match>
        <Match when={component() === "TreeViewChild"}>
          <PageAttrRender data={props.data} metaVertex={props.meta} />
        </Match>
        <Match when={component() === "Accordion"}>
          <Accordion
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
          >
            {props.data?.P[props.meta.P[IdAttr]] ?? props.meta.P.children}
          </Accordion>
        </Match>
        <Match when={component() === "Breadcrumb"}>
          <Breadcrumbs
            aria-label="breadcrumb"
            // @ts-ignore
            separator={props.meta.P.separator ?? "›"}
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
          >
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </Breadcrumbs>
        </Match>
        <Match when={component() === "ProgressBar"}>
          <Progress
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
          />
        </Match>
        <Match when={component() === "Form"}>
          <FormWrapper meta={props.meta} />
        </Match>
        <Match when={component() === "Divider"}>
          <hr
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={` h:${props.meta.P.height ?? "2"} color:${props.meta.P.color ?? "lightgrey"} w:full ${mergeCSS(defaultValues().class, props.meta.P.class)}`}
          />
        </Match>
        <Match when={component() === "Heading"}>
          <Heading
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
            divider={props.meta.P.divider ?? true}
            etc={props.meta.P.class}
            heading={props.meta.P.heading}
            subheading={props.meta.P.subheading}
          />
        </Match>
        <Match when={component() === "Rating"}>
          <StarRating
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
            etc={props.meta.P.class}
            heading={props.meta.P.heading ?? "Rating"}
          />
        </Match>
        <Match when={component() === "Label"}>
          <Label
            meta={props.meta}
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
          >
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </Label>
        </Match>
        <Match when={true}>
          <Dynamic class={props.meta.P.class} component={props.meta.P.as || "div"}>
            {props.children}
            <PageAttrRender data={props.data} metaVertex={props.meta} />
          </Dynamic>
        </Match>
      </Switch>
    </Show>
  );
}
