import { createMemo, type JSXElement, Match, Show, Switch, useContext } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { A } from "@solidjs/router";
import { Dynamic } from "solid-js/web";
import { GraphContext, type GraphInterface, IdAttr, type Vertex } from "~/lib/graph/graph";
import { getChildVertexes, getSelectionOptions } from "~/lib/graph/get/sync/traverse";
import type { ComponentProps } from "~/components/fields/ComponentType";
import {
  Accordion,
  Avatar,
  Breadcrumbs,
  Progress,
  Select,
  Spinner,
  Tabs
} from "~/components/solid_blocks";
import { PageAttrRender, } from "~/components/page_attr_render/PageAttrRender";
import { TreeView } from "~/components/solid_blocks/TreeView";
import { Collapsible } from "~/components/solid_blocks/Collapsible";
import type { SetStoreFunction, Store } from "solid-js/store";
import { Repeater } from "~/components/page_attr_render/Repeater";
import { Table, TableBodyCell, TableHeadCell } from "~/components/Table";
import { Heading } from "~/components/solid_blocks/Heading";
import { StarRating } from "~/components/solid_blocks/Rating";
import { PageRenderVertexContext, RepeaterVertexContext } from "~/components/page_attr_render/Context";

import { APP_BASE_URL } from "~/lib/constants";
import { getViewValue } from "~/lib/graph/get/sync/getViewValue";
import { FormWrapper } from "~/components/fields/FormWrapper";
import { getCompProps } from "~/lib/graph/get/sync/getProps";
import { deNullify } from "~/lib/utils";
import { mergeCSS } from "~/components/css_properties/cssUtils";
import { getComponent } from "~/components/page_attr_render/utils/getComponent";
import {
  getDataVertex
} from "~/components/page_attr_render/utils/getDataVertex";
import { getLastItem } from "~/components/page_attr_render/utils/getLastItem";
import { PageViewWrapper } from "~/pages/PageViewWrapper";
import { PageDesignerLabels } from "~/lib/drag_drop/constant";
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
  props: ComponentProps & {
    component?: string; // depricated
    componentName?: string;
    disabled?: boolean;
    txnId?: number;
    children?: JSXElement;
    [key: string]: any;
    applyDefaults?: boolean;
  },
) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const parentItems = useContext(PageRenderVertexContext);
  const component = createMemo(() => props.component ?? props.componentName ?? props.meta.P.component);
  const parentComponent = createMemo(() => getComponent(graph, getLastItem(parentItems, 2))?.P[IdAttr]);
  const repeaterContext = useContext(RepeaterVertexContext);
  const defaultValues = createMemo(() => props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {});

  return (
    <Show
      when={!props.disabled}
      fallback={getViewValue(props.data?.P[props.meta.P[IdAttr]])}
    >
      <Switch>
        <Match when={component() === "Repeater"}>
          <Repeater meta={props.meta} data={props.data} />
        </Match>
        <Match when={component() === "Text"}>
          <Show
            when={props.meta.P.as}
            fallback={getText(graph, setGraph, props.meta.P.text, repeaterContext)}
          >
            <Dynamic component={props.meta.P.as} class={props.meta.P.class}>
              {getText(graph, setGraph, props.meta.P.text, repeaterContext)}
              {props.children}
              <PageAttrRender metaVertex={props.meta} data={props.data} />
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
                  href={`${APP_BASE_URL}/${vertex().P.name}`}
                  draggable
                >
                  <Show
                    when={!props.meta.P.text}
                    fallback={getText(graph, setGraph, props.meta.P.text, repeaterContext)}
                  >
                    {props.children}
                    <PageAttrRender metaVertex={props.meta} data={props.data} />
                  </Show>
                </A>
              )}
            </Match>
            <Match when={props.meta.P.href}>
              <A
                {...defaultValues()}
                {...deNullify(props.meta.P)}
                class={mergeCSS(defaultValues().class, props.meta.P.class)}
                href={getUrl(graph, setGraph, props.meta.P.href, repeaterContext) || "#"}
                draggable
              >
                <Show
                  when={!props.meta.P.text}
                  fallback={getText(graph, setGraph, props.meta.P.text, repeaterContext)}
                >
                  {props.children}
                  <PageAttrRender metaVertex={props.meta} data={props.data} />
                </Show>
              </A>
            </Match>
            <Match when={true}>
              <a draggable>
                {props.children}
                <PageAttrRender metaVertex={props.meta} data={props.data} />
              </a>
            </Match>
          </Switch>
        </Match>
        <Match when={PageDesignerLabels.filter(label => label !== "Form").includes(component())}>
          {/* g:'Page':-'*[P.name="book"]' */}
          {/* <Show when={props.meta.P.data} keyed> */}
           <PageViewWrapper pageVertexLabel={component()} expression={props.meta.P.data} />
          {/* </Show> */}
        </Match>
        <Match when={component() === "Image"}>
          <img
            loading="lazy"
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
            src={getText(graph, setGraph, props.meta.P.src, repeaterContext)}
            draggable={true}
            alt={"img"}
          />
        </Match>
        <Match when={component() === "Tabs"}>
          <Tabs
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
          >
            <PageAttrRender metaVertex={props.meta} data={props.data} />
          </Tabs>
        </Match>
        <Match when={component() === "TabContainer"}>
          <PageAttrRender metaVertex={props.meta} data={props.data} />
        </Match>
        <Match when={component() === "TabList"}>
          <PageAttrRender metaVertex={props.meta} data={props.data} />
        </Match>
        <Match when={component() === "Icon"}>
          <Icon
            icon={props.meta.P.icon}
            width={props.meta.P.width || "24"}
            height={props.meta.P.height || "24"}
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
              <Match when={props.data?.P[props.meta.P.name] ?? props.meta.P.children}>
                {props.data?.P[props.meta.P.name]}
              </Match>
              <Match when={true}>
                <PageAttrRender metaVertex={props.meta} data={props.data} />
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
            <PageAttrRender metaVertex={props.meta} data={props.data} />
          </Table>
        </Match>
        <Match when={component() === "TableHeader" && getChildVertexes(graph, ["Attr"], [props.meta]).vertexes?.length}>
          <TableHeadCell class={"p:10 text:center h:5"}>
            <PageAttrRender metaVertex={props.meta} data={props.data} />
          </TableHeadCell>
        </Match>
        <Match when={component() === "TableRow"}>
          <TableBodyCell class={"h:50 text:center bg:#ffffff b:1px|solid|#000"}>
            <PageAttrRender metaVertex={props.meta} data={props.data} />
          </TableBodyCell>
        </Match>
        <Match when={component() === "Collapsible"}>
          <Collapsible
            isOpen={props.meta.P.isOpen ?? true}
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
          >
            <PageAttrRender metaVertex={props.meta} data={props.data} />
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
          <TreeView title={props.meta.P?.title ?? "MenuItem"} meta={props.meta}>
            <PageAttrRender metaVertex={props.meta} data={props.data} />
          </TreeView>
        </Match>
        <Match when={component() === "TreeViewChild"}>
          <PageAttrRender metaVertex={props.meta} data={props.data} />
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
            // @ts-ignore
            separator={props.meta.P.separator ?? "›"}
            aria-label="breadcrumb"
            {...defaultValues()}
            {...deNullify(props.meta.P)}
            class={mergeCSS(defaultValues().class, props.meta.P.class)}
          >
            <PageAttrRender metaVertex={props.meta} data={props.data} />
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
            etc={props.meta.P.class}
            heading={props.meta.P.heading}
            divider={props.meta.P.divider ?? true}
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
            <PageAttrRender metaVertex={props.meta} data={props.data} />
          </Label>
        </Match>
        <Match when={true}>
          <Dynamic component={props.meta.P.as || "div"} class={props.meta.P.class}>
            {props.children}
            <PageAttrRender metaVertex={props.meta} data={props.data} />
          </Dynamic>
        </Match>
      </Switch>
    </Show>
  );
}
