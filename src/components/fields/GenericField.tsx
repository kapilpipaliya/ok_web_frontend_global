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
import { PageItemRender, PageRenderUtils, } from "~/components/page_item_render/PageItemRender";
import CustomButton from "~/components/solid_blocks/button/buttons";
import TreeView from "~/components/solid_blocks/TreeView";
import { Collapsible } from "~/components/solid_blocks/Collapsible";
import type { SetStoreFunction, Store } from "solid-js/store";
import { Repeater } from "~/components/page_item_render/Repeater";
import { Table, TableBodyCell, TableHeadCell } from "~/components/Table";
import Heading from "~/components/solid_blocks/Heading";
import StarRating from "~/components/solid_blocks/Rating";
import { PageView } from "~/components/page_item_render/PageView";
import { PageRenderVertexContext, RepeaterVertexContext } from "~/components/page_item_render/Context";
import { getLastItem } from "~/components/page_item_render/getLastItem";
import { APP_BASE_URL } from "~/lib/constants";
import { getViewValue } from "~/lib/graph/get/sync/getViewValue";
import { FormWrapper } from "~/components/page_item_render/FormWrapper";
import { getCompProps } from "~/lib/graph/get/sync/graph_functions";
import { deNullify } from "~/lib/utils";

// This component support rendering Child Themselves by calling PageRender.
function getAttrs(meta: Vertex) {
  if (meta.P.attr) {
    return JSON.parse(meta.P.attr);
  }
  return {};
}

export function getText(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  projection: string,
  repeaterContext: Vertex[]
) {
  return getSelectionOptions(graph, setGraph, repeaterContext, projection)
    .vertexes as string;
}

export function getUrl(
  graph: Store<GraphInterface>,
  setGraph: SetStoreFunction<GraphInterface>,
  projection: string,
  repeaterContext: Vertex[]
) {
  const url = getSelectionOptions(graph, setGraph, repeaterContext, projection)
    .vertexes as string | undefined;
  if (typeof url === "string" && url.startsWith("/")) {
    // url = (showNav() ? '/nav' : '') + url;
  }
  return url;
}

export function GenericField(
  props: ComponentProps & {
    component?: string;
    disabled?: boolean;
    txnId?: number;
    children?: JSXElement;
    [key: string]: any;
    applyDefaults?: boolean;
  },
) {

  const [graph, setGraph] = useContext(GraphContext)!;
  const parentItems = useContext(PageRenderVertexContext);
  const component = createMemo(() => props.component || props.meta.P.component);

  const parentComponent = createMemo(() => {
    return PageRenderUtils.getComponent(graph, getLastItem(parentItems, 2))?.P[
      IdAttr
    ];
  });

  const repeaterContext = useContext(RepeaterVertexContext);

  const propWithDefault = (key: string, defaultValue?: any) => {
    return props.meta.P[`${key}`] ?? defaultValue;
  };

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
            fallback={getText(
              graph,
              setGraph,
              props.meta.P.text,
              repeaterContext,
            )}
          >
            <Dynamic
              component={props.meta.P.as}
              class={props.meta.P.class}
            >
              {getText(
                graph,
                setGraph,
                props.meta.P.text,
                repeaterContext,
              )}
              {props.children}
              <PageItemRender metaVertex={props.meta} />
            </Dynamic>
          </Show>
        </Match>
        <Match when={component() === "A"}>
          <Switch>
            <Match when={PageRenderUtils.getDataVertex(graph, props.meta)}>
              {(vertex) => (
                <A
                  {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
                  {...deNullify(props.meta.P)}
                  href={`${APP_BASE_URL}/${vertex().P.name}`}
                  draggable
                >
                  <Show
                    when={!props.meta.P.text}
                    fallback={getText(
                      graph,
                      setGraph,
                      props.meta.P.text,
                      repeaterContext,
                    )}
                  >
                    {props.children}
                    <PageItemRender metaVertex={props.meta} />
                  </Show>
                </A>
              )}
            </Match>
            <Match when={props.meta.P.href}>
              <A
                {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
                {...deNullify(props.meta.P)}
                href={getUrl(
                  graph,
                  setGraph,
                  props.meta.P.href,
                  repeaterContext,
                )}
                draggable
              >
                <Show
                  when={!props.meta.P.text}
                  fallback={getText(
                    graph,
                    setGraph,
                    props.meta.P.text,
                    repeaterContext,
                  )}
                >
                  {props.children}
                  <PageItemRender metaVertex={props.meta} />
                </Show>
              </A>
            </Match>
            <Match when={true}>
              <a draggable>
                {props.children}
                <PageItemRender metaVertex={props.meta} />
              </a>
            </Match>
          </Switch>
        </Match>

        <Match when={component() === "Page"}>
          {/* g:'Page':-'*[P.name="book"]' */}
          <PageView metaVertex={props.data} />
        </Match>
        <Match when={component() === "Image"}>
          <img
            loading="lazy"
            {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
            {...deNullify(props.meta.P)}
            src={getText(
              graph,
              setGraph,
              props.meta.P.src,
              repeaterContext,
            )}
            draggable={true}
            alt={"img"}
          />
        </Match>
        <Match when={component() === "Tabs"}>
          <Tabs
            {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
            {...deNullify(props.meta.P)}
          >
            <PageItemRender metaVertex={props.meta} />
          </Tabs>
        </Match>
        <Match when={component() === "TabContainer"}>
          <PageItemRender metaVertex={props.meta} />
        </Match>
        <Match when={component() === "TabList"}>
          <PageItemRender metaVertex={props.meta} />
        </Match>
        <Match when={component() === "Icon"}>
          <Icon
            icon={props.meta.P.icon}
            class={props.meta.P.class}
            width={props.meta.P.width || "24"}
            height={props.meta.P.height || "24"}
            {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
            {...deNullify(props.meta.P)}
          />
        </Match>
        <Match when={component() === "Box" && props.meta.P.text}>
          <Dynamic
            component={props.meta.P.as || "div"}
            {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
            {...deNullify(props.meta.P)}
            {...getAttrs(props.meta)}
            class={props.meta.P.class}
          >
            {getText(
              graph,
              setGraph,
              props.meta.P.text,
              repeaterContext,
            )}
          </Dynamic>
        </Match>
        <Match when={component() === "Button"}>
          <CustomButton
            {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
            {...deNullify(props.meta.P)}
          >
            {props.data?.P[props.meta.P[IdAttr]] ?? props.meta.P.children}
          </CustomButton>
        </Match>
        <Match when={component() === "Table"}>
          <Table
            headers={
              getChildVertexes(graph, ["Attr"], [props.meta]).vertexes
                ?.length || []
            }
            {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
            {...deNullify(props.meta.P)}
          >
            <PageItemRender metaVertex={props.meta} />
          </Table>
        </Match>
        <Match
          when={
            component() === "TableHeader" &&
            getChildVertexes(graph, ["Attr"], [props.meta]).vertexes?.length
          }
        >
          <TableHeadCell class={"p:10 text:center h:5"}>
            <PageItemRender metaVertex={props.meta} />
          </TableHeadCell>
        </Match>
        <Match when={component() === "TableRow"}>
          <TableBodyCell class={"h:50 text:center bg:#ffffff b:1px|solid|#000"}>
            <PageItemRender metaVertex={props.meta} />
          </TableBodyCell>
        </Match>
        <Match when={component() === "Collapsible"}>
          <Collapsible
            {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
            {...deNullify(props.meta.P)}
          >
            <PageItemRender metaVertex={props.meta} />
          </Collapsible>
        </Match>
        <Match when={component() === "Avtar"}>
          <Avatar
            {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
            {...deNullify(props.meta.P)}
          >
            {props.data?.P[props.meta.P[IdAttr]] ?? props.meta.P.children}
          </Avatar>
        </Match>
        <Match when={component() === "Select"}>
          <Select
            {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
            {...props.props.meta.P}
          >
            {props.props.data?.P[props.props.meta.P[IdAttr]] ??
              props.props.meta.P.children}
          </Select>
        </Match>
        <Match when={component() === "LoadIndicator"}>
          <Spinner
            {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
            {...props.meta?.P}
          >{props.meta.P.children}</Spinner>
        </Match>
        <Match when={component() === "TreeViewItem"}>
          <TreeView
            title={props.meta.P?.props.title ?? "MenuItem"}
            meta={props.meta}
          >
            <PageItemRender metaVertex={props.meta} />
          </TreeView>
        </Match>
        <Match when={component() === "TreeViewChild"}>
          <PageItemRender metaVertex={props.meta} />
        </Match>
        <Match when={component() === "Accordion"}>
          <Accordion
            {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
            {...deNullify(props.meta.P)}
          >
            {props.data?.P[props.meta.P[IdAttr]] ?? props.meta.P.children}
          </Accordion>
        </Match>
        <Match when={component() === "Breadcrumb"}>
          <Breadcrumbs
            separator={props.meta.P.separator ?? "›"}
            aria-label="breadcrumb"
            {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
            {...deNullify(props.meta.P)}
          >
            <PageItemRender metaVertex={props.meta} />
          </Breadcrumbs>
        </Match>
        <Match when={component() === "ProgressBar"}>
          <Progress
            {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
            {...deNullify(props.meta.P)}
          />
        </Match>
        <Match when={component() === "Form"}>
          <FormWrapper meta={props.meta} />
        </Match>
        <Match when={component() === "Divider"}>
          <hr
            {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
            {...deNullify(props.meta.P)}
            class={` h:${propWithDefault("height", "2")} color:${propWithDefault("color", "lightgrey")} w:full ${props.meta.P.class}`}
          />
        </Match>
        <Match when={component() === "Heading"}>
          <Heading
            {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
            {...deNullify(props.meta.P)}
            etc={props.meta.P.class}
            heading={propWithDefault("heading")}
            divider={propWithDefault("divider", true)}
            subheading={propWithDefault("subheading")}
          />
        </Match>
        <Match when={component() === "Rating"}>
          <StarRating
            {...(props.applyDefaults && graph.componentIdMap[component()] ? getCompProps(graph, graph.vertexes[graph.componentIdMap[component()]]) : {})}
            {...deNullify(props.meta.P)}
            etc={props.meta.P.class}
            heading={propWithDefault("heading", "Rating")}
          />
        </Match>
        <Match when={true}>
          <Dynamic
            component={props.meta.P.as || "div"}
            class={props.meta.P.class}
          >
            {props.children}
            <PageItemRender metaVertex={props.meta} />
          </Dynamic>
        </Match>
      </Switch>
    </Show>
  );
}
