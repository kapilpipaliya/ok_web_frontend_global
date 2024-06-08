import {
  createMemo,
  type JSXElement,
  Match,
  Show,
  splitProps,
  Switch,
  useContext
} from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { A, useNavigate } from "@solidjs/router";
import { Dynamic } from "solid-js/web";
import {
  GraphContext,
  GraphInterface,
  IdAttr,
  type Vertex
} from "~/lib/graph/graph";
import {
  commitTxn,
  getNewTxnId,
  revertTransaction
} from "~/lib/graph/transaction";
import {
  getValueFromVertexOrKey
} from "~/lib/utils";
import {
  getChildVertexes,
  getSelectionOptions
} from "~/lib/graph/get/sync/traverse";
import { createForm } from "~/lib/graph/mutate/form_functions";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import type { ComponentProps } from "~/components/ComponentType";
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
import {
  PageItemRender,
  PageRenderUtils,
} from "./PageItemRender";
import CustomButton from "~/components/solid-blocks/blocks/button/buttons";
import TreeView from "~/components/solid-blocks/blocks/treeview/treeview";
import {
  Collapsible
} from "~/components/solid-blocks/blocks/collapsible/collapsible";
import { useToast } from "~/components/custom/Toast";
import { submitDataCall } from "~/lib/api/api_functions";
import { createStore, SetStoreFunction, Store } from "solid-js/store";
import { Repeater } from "~/components/dynamic/fields/static/Repeater";
import { Table, TableBodyCell, TableHeadCell } from "~/components/custom/Table";
import Heading from "~/components/solid-blocks/blocks/Heading";
import StarRating from "~/components/solid-blocks/blocks/Rating";
import { PageView } from "~/components/dynamic/fields/static/PageView";
import {
  PageRenderVertexContext, RepeaterVertexContext
} from "~/components/dynamic/fields/static/Context";
import { getLastItem } from "~/components/dynamic/fields/static/getLastItem";
import { APP_BASE_URL } from "~/lib/constants";
import { FormContext } from "~/lib/contexts";
import { getViewValue } from "~/lib/graph/get/sync/getViewValue";

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
function FormWrapper(
  props: ComponentProps & {
    submitButton?: any;
  },
) {
  const { Ws } = useContext(WsContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  const { showLoadingToast } = useToast();
  const navigate = useNavigate();

  const cleanUpConfig = {} as { [key: string]: any };
  const txnId = getNewTxnId(graph, setGraph);
  const {formMeta: formDeisgnerMeta, formData: formDesignerDeta} = useContext(FormContext)!;

  // const [dataVertex, setDataVertex] = createSignal<Vertex>();
  // const [metaVertex, setMetaVertex] = createSignal<Vertex>();


  const [formData, setFormData] = createStore({
    txnId,
    cleanUpConfig: () => cleanUpConfig,
  } as {
    cleanUpConfig: () => { [key: string]: any };
    txnId: number;
    formMeta: Vertex;
    formData: Vertex;
    tabs: string[];
    groupByTabsAndGroup: {
      [tab: string]: {
        [group: string]: Vertex[];
      };
    };
  });


  // if (!props.data?.id) {

  const createResult = createForm(graph, setGraph, txnId, Ws, formDeisgnerMeta.P[IdAttr]);
  if (createResult.error) return createResult.error;
  setFormData('formData', createResult.vertex!);

  // } else {
  //   const loadResult = loadForm(graph, props.id);
  //   if (loadResult.error) return loadResult.error;
  //   dataVertex = loadResult.vertex!;
  // }

  // const [divRef, setDivRef] = createSignal<HTMLDivElement>();

  const onSubmit = async () => {
    const data = commitTxn(txnId, Ws);
    await showLoadingToast({
      promise: submitDataCall(data, graph, setGraph, txnId),
      loadMessage: "Submitting Data...",
      successMessage: "Data submitted successfully",
      onSuccess: (value) => {
        setTimeout(() => navigate(-1), 0);
      },
    });
  };

  const onCancel = () => {
    revertTransaction(txnId);
    setTimeout(() => navigate(-1));
  };

  return (
    <div
      ref={(el) => {
        // setDivRef(el);
      }}
    >
      <FormContext.Provider value={formData}>
        <div class="">
          <PageItemRender metaVertex={props.meta}/>
        </div>
        <div />

        <div class="flex gap:1">
          <Show
            when={props.submitButton}
            fallback={
              <GenericField
                meta={
                  {
                    P: {
                      component: "Button",
                      props: {
                        children: "Submit",
                        onClick: () => onSubmit(),
                      },
                    },
                  } as any
                }
              />
            }
          >
            {props.submitButton}
          </Show>

          <GenericField
            meta={
              {
                P: {
                  component: "Button",
                  props: {
                    onClick: () => onCancel(),
                    variant: "outlined",
                    class: "border-color:#FF0000 color:#FF0000",
                    children: "Cancel",
                  },
                },
              } as any
            }
          />
        </div>
      </FormContext.Provider>
    </div>
  );
}
