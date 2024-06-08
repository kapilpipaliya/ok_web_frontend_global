import {createMemo, type JSXElement, Match, Show, Switch, useContext} from "solid-js";
import {Icon} from "@iconify-icon/solid";
import {A} from "@solidjs/router";
import {Dynamic} from "solid-js/web";
import {GraphContext, GraphInterface, IdAttr, type Vertex} from "~/lib/graph/graph";
import {getChildVertexes, getSelectionOptions} from "~/lib/graph/get/sync/traverse";
import type {ComponentProps} from "~/components/ComponentType";
import {
  Accordion,
  Avatar,
  Breadcrumbs,
  Progress,
  Select,
  Spinner,
  TabContainer,
  TabList,
  Tabs
} from "~/components/solid-blocks/blocks";
import {PageItemRender, PageRenderUtils,} from "./PageItemRender";
import CustomButton from "~/components/solid-blocks/blocks/button/buttons";
import TreeView from "~/components/solid-blocks/blocks/treeview/treeview";
import {Collapsible} from "~/components/solid-blocks/blocks/collapsible/collapsible";
import {SetStoreFunction, Store} from "solid-js/store";
import {Repeater} from "~/components/dynamic/fields/static/Repeater";
import {Table, TableBodyCell, TableHeadCell} from "~/components/custom/Table";
import Heading from "~/components/solid-blocks/blocks/Heading";
import StarRating from "~/components/solid-blocks/blocks/Rating";
import {PageView} from "~/components/dynamic/fields/static/PageView";
import {PageRenderVertexContext, RepeaterVertexContext} from "~/components/dynamic/fields/static/Context";
import {getLastItem} from "~/components/dynamic/fields/static/getLastItem";
import {APP_BASE_URL} from "~/lib/constants";
import {getViewValue} from "~/lib/graph/get/sync/getViewValue";
import {FormWrapper} from "~/components/dynamic/fields/static/FormWrapper";

// This component support rendering Child Themselves by calling PageRender.
function getAttrs(meta: Vertex) {
  if (meta.P.props?.attr) {
    return JSON.parse(meta.P.props?.attr);
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
    return props.meta.P.props[`${key}`] ?? defaultValue;
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
            when={props.meta.P.props?.as}
            fallback={getText(
              graph,
              setGraph,
              props.meta.P.props?.text,
              repeaterContext,
            )}
          >
            <Dynamic
              component={props.meta.P.props?.as}
              class={props.meta.P.props["class"]}
            >
              {getText(
                graph,
                setGraph,
                props.meta.P.props?.text,
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
                  {...props.meta.P.props}
                  href={`${APP_BASE_URL}/${vertex().P.name}`}
                  draggable
                >
                  <Show
                    when={!props.meta.P.props?.text}
                    fallback={getText(
                      graph,
                      setGraph,
                      props.meta.P.props?.text,
                      repeaterContext,
                    )}
                  >
                    {props.children}
                    <PageItemRender metaVertex={props.meta} />
                  </Show>
                </A>
              )}
            </Match>
            <Match when={props.meta.P.props?.href}>
              <A
                {...props.meta.P.props}
                href={getUrl(
                  graph,
                  setGraph,
                  props.meta.P.href,
                  repeaterContext,
                )}
                draggable
              >
                <Show
                  when={!props.meta.P.props?.text}
                  fallback={getText(
                    graph,
                    setGraph,
                    props.meta.P.props?.text,
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
            {...props.meta.P.props}
            src={getText(
              graph,
              setGraph,
              props.meta.P.props?.src,
              repeaterContext,
            )}
            draggable={true}
            alt={"img"}
          />
        </Match>
        <Match when={component() === "Tabs"}>
          <Tabs {...props.meta.P.props}>
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
            icon={props.meta.P.props?.icon}
            class={props.meta.P?.props["class"]}
            width={props.meta.P.props?.width || "24"}
            height={props.meta.P.props?.height || "24"}
            {...props.meta.P.props}
          />
        </Match>
        <Match when={component() === "Box" && props.meta.P.props?.text}>
          <Dynamic
            component={props.meta.P.props?.as || "div"}
            {...getAttrs(props.meta)}
            class={props.meta.P.props["class"]}
          >
            {getText(
              graph,
              setGraph,
              props.meta.P.props?.text,
              repeaterContext,
            )}
          </Dynamic>
        </Match>
        <Match when={component() === "Button"}>
          <CustomButton {...props.meta.P.props}>
            {props.data?.P[props.meta.P[IdAttr]] ?? props.meta.P.children}
          </CustomButton>
        </Match>
        <Match when={component() === "Table"}>
          <Table
            headers={
              getChildVertexes(graph, ["Attr"], [props.meta]).vertexes
                ?.length || []
            }
            {...props.meta.P.props}
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
          <Collapsible {...props.meta.P.props}>
            <PageItemRender metaVertex={props.meta} />
          </Collapsible>
        </Match>
        <Match when={component() === "Avtar"}>
          <Avatar {...props.meta.P.props}>
            {props.data?.P[props.meta.P[IdAttr]] ?? props.meta.P.children}
          </Avatar>
        </Match>
        <Match when={component() === "Select"}>
          <Select {...props.props.meta.P.props}>
            {props.props.data?.P[props.props.meta.P[IdAttr]] ??
              props.props.meta.P.props.children}
          </Select>
        </Match>
        <Match when={component() === "LoadIndicator"}>
          <Spinner {...props.meta?.P.props}>{props.meta.P.children}</Spinner>
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
          <Accordion {...props.meta.P.props}>
            {props.data?.P[props.meta.P[IdAttr]] ?? props.meta.P.children}
          </Accordion>
        </Match>
        <Match when={component() === "Breadcrumb"}>
          <Breadcrumbs
            separator={props.meta.P.props.separator ?? "›"}
            aria-label="breadcrumb"
            {...props.meta.P.props}
          >
            <PageItemRender metaVertex={props.meta} />
          </Breadcrumbs>
        </Match>
        <Match when={component() === "ProgressBar"}>
          <Progress {...props.meta.P.props} />
        </Match>
        <Match when={component() === "Form"}>
          <FormWrapper meta={props.meta} />
        </Match>
        <Match when={component() === "Divider"}>
          <hr
            {...props.meta.P.props}
            class={` h:${propWithDefault("height", "2")} color:${propWithDefault("color", "lightgrey")} w:full ${props.meta.P.props["class"]}`}
          />
        </Match>
        <Match when={component() === "Heading"}>
          <Heading
            etc={props.meta.P.props["class"]}
            heading={propWithDefault("heading")}
            divider={propWithDefault("divider", true)}
            subheading={propWithDefault("subheading")}
          />
        </Match>
        <Match when={component() === "Rating"}>
          <StarRating
            etc={props.meta.P.props["class"]}
            heading={propWithDefault("heading", "Rating")}
          />
        </Match>
        <Match when={true}>
          <Dynamic
            component={props.meta.P.props?.as || "div"}
            class={props.meta.P.props["class"]}
          >
            {props.children}
            <PageItemRender metaVertex={props.meta} />
          </Dynamic>
        </Match>
      </Switch>
    </Show>
  );
}
