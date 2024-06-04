import {
  createMemo,
  createSignal,
  type JSXElement,
  Match,
  onCleanup,
  Show,
  splitProps,
  Switch,
  untrack,
  useContext,
} from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { A, useNavigate } from "@solidjs/router";
import { Dynamic } from "solid-js/web";
import { GraphContext, IdAttr, type Vertex } from "~/lib/graph/graph";
import {
  commitTxn,
  getNewTxnId,
  revertTransaction,
} from "~/lib/graph/transaction";
import {
  APP_BASE_URL,
  FormContext,
  getTextColumnValue,
  getValueFromVertexOrKey,
} from "~/lib/Utils";
import {
  getChildVertexes,
} from "~/lib/graph/get/sync/traverse";
import {
  createForm,
  createMeta,
  loadForm,
} from "~/lib/graph/mutate/form_functions";
import { getLastItem } from "~/lib/functions";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import type { ComponentProps } from "~/components/ComponentType";
import {
  Accordion,
  Avatar,
  Breadcrumbs,
  Progress,
  Select,
  Spinner,
  Tabs,
} from "~/components/solid-blocks/blocks";
import {
  getText,
  getUrl,
  PageItemRender,
  PageRenderContext,
  PageRenderUtils,
  PageView,
  RepeaterContext,
} from "./GenaricField";
import CustomButton from "~/components/solid-blocks/blocks/button/buttons";
import TreeView from "~/components/solid-blocks/blocks/treeview/treeview";
import { Collapsible } from "~/components/solid-blocks/blocks/collapsible/collapsible";
import { useToast } from "~/components/custom/Toast";
import { submitDataCall } from "~/components/api/api_functions";
import { createStore } from "solid-js/store";
import { Repeater } from "~/components/solid-blocks/blocks/repeater/Repeater";

// This component support rendering Child Themselves by calling PageRender.
function getAttrs(meta: Vertex) {
  if (meta.P.props?.attr) {
    return JSON.parse(meta.P.props?.attr);
  }
  return {};
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
  const [field, others] = splitProps(props, [
    "meta",
    "data",
    "children",
    "disabled",
    "component",
    "txnId",
    "setValue",
  ]);

  const [graph, setGraph] = useContext(GraphContext)!;
  const parentItems = useContext(PageRenderContext);
  const component = createMemo(() => field.component || field.meta.P.component);

  const parentComponent = createMemo(() => {
    return PageRenderUtils.getComponent(graph, getLastItem(parentItems, 2))?.P[
      IdAttr
    ];
  });

  const repeaterContext = useContext(RepeaterContext);

  return (
    <Show
      when={!field.disabled}
      fallback={getTextColumnValue(field.data?.P[field.meta.P[IdAttr]])}
    >
      <Switch>
        <Match when={component() === "Repeater"}>
          <Repeater meta={field.meta} data={field.data} />
        </Match>
        <Match when={component() === "Text"}>
          <Show
            when={field.meta.P.props?.as}
            fallback={getText(
              graph,
              setGraph,
              field.meta.P.props?.text,
              repeaterContext,
            )}
          >
            <Dynamic
              component={field.meta.P.props?.as}
              class={getValueFromVertexOrKey(field.meta.P.props, "class")}
            >
              {getText(
                graph,
                setGraph,
                field.meta.P.props?.text,
                repeaterContext,
              )}
              {field.children}
              <PageItemRender metaVertex={field.meta} />
            </Dynamic>
          </Show>
        </Match>
        <Match when={component() === "A"}>
          <Switch>
            <Match when={PageRenderUtils.getDataVertex(graph, field.meta)}>
              {(vertex) => (
                <A
                  {...field.meta.P.props}
                  href={`${APP_BASE_URL}/${vertex().P.name}`}
                  draggable
                >
                  <Show
                    when={!field.meta.P.props?.text}
                    fallback={getText(
                      graph,
                      setGraph,
                      field.meta.P.props?.text,
                      repeaterContext,
                    )}
                  >
                    {field.children}
                    <PageItemRender metaVertex={field.meta} />
                  </Show>
                </A>
              )}
            </Match>
            <Match when={field.meta.P.props?.href}>
              <A
                {...field.meta.P.props}
                href={getUrl(
                  graph,
                  setGraph,
                  field.meta.P.href,
                  repeaterContext,
                )}
                draggable
              >
                <Show
                  when={!field.meta.P.props?.text}
                  fallback={getText(
                    graph,
                    setGraph,
                    field.meta.P.props?.text,
                    repeaterContext,
                  )}
                >
                  {field.children}
                  <PageItemRender metaVertex={field.meta} />
                </Show>
              </A>
            </Match>
            <Match when={true}>
              <a draggable>
                {field.children}
                <PageItemRender metaVertex={field.meta} />
              </a>
            </Match>
          </Switch>
        </Match>

        <Match when={component() === "Page"}>
          {/* g:'Page':-'*[P.name="book"]' */}
          <PageView vertex={field.data} />
        </Match>
        <Match when={component() === "Image"}>
          <img
            loading="lazy"
            {...field.meta.P.props}
            src={getText(
              graph,
              setGraph,
              field.meta.P.props?.src,
              repeaterContext,
            )}
            draggable={true}
            alt={"img"}
          />
        </Match>
        <Match when={component() === "Tabs"}>
          <Tabs {...field.meta.P.props}>
            <PageItemRender metaVertex={field.meta} />
          </Tabs>
        </Match>
        <Match when={component() === "TabContainer"}>
          <PageItemRender metaVertex={field.meta} />
        </Match>
        <Match when={component() === "TabList"}>
          <PageItemRender metaVertex={field.meta} />
        </Match>
        <Match when={component() === "Icon"}>
          <Icon
            icon={field.meta.P.props?.icon}
            class={getValueFromVertexOrKey(field.meta.P?.props, "class")}
            width={field.meta.P.props?.width || "24"}
            height={field.meta.P.props?.height || "24"}
            {...field.meta.P.props}
          />
        </Match>
        <Match when={component() === "Box" && field.meta.P.props?.text}>
          <Dynamic
            component={field.meta.P.props?.as || "div"}
            {...getAttrs(field.meta)}
            class={getValueFromVertexOrKey(field.meta.P.props, "class")}
          >
            {getText(
              graph,
              setGraph,
              field.meta.P.props?.text,
              repeaterContext,
            )}
          </Dynamic>
        </Match>
        <Match when={component() === "Button"}>
          <CustomButton {...field.meta.P.props}>
            {field.data?.P[field.meta.P[IdAttr]] ?? field.meta.P.children}
          </CustomButton>
        </Match>
        <Match when={component() === "Table"}>
          <table {...field.meta.P.props}>
            <PageItemRender metaVertex={field.meta} />
          </table>
        </Match>
        <Match
          when={
            component() === "TableHeader" &&
            getChildVertexes(graph, ["Attr"], [field.meta]).vertexes?.length
          }
        >
          <thead class={"r:5|5|5|5"}>
            <tr class={"p:10 text:center h:5"}>
              <PageItemRender metaVertex={field.meta} />
            </tr>
          </thead>
        </Match>
        <Match when={component() === "TableRow"}>
          <tbody>
            <tr class={"h:50 text:center bg:#ffffff b:1px|solid|#000"}>
              <PageItemRender metaVertex={field.meta} />
            </tr>
          </tbody>
        </Match>
        <Match when={component() === "Collapsible"}>
          <Collapsible {...field.meta.P.props}>
            <PageItemRender metaVertex={field.meta} />
          </Collapsible>
        </Match>
        <Match when={component() === "Avtar"}>
          <Avatar {...field.meta.P.props}>
            {field.data?.P[field.meta.P[IdAttr]] ?? field.meta.P.children}
          </Avatar>
        </Match>
        <Match when={component() === "Select"}>
          <Select {...props.field.meta.P.props}>
            {props.field.data?.P[props.field.meta.P[IdAttr]] ??
              props.field.meta.P.props.children}
          </Select>
        </Match>
        <Match when={component() === "LoadIndicator"}>
          <Spinner {...field.meta?.P.props}>{field.meta.P.children}</Spinner>
        </Match>
        <Match when={component() === "TreeViewItem"}>
          <TreeView
            title={field.meta.P?.props.title ?? "MenuItem"}
            meta={field.meta}
          >
            <PageItemRender metaVertex={field.meta} />
          </TreeView>
        </Match>
        <Match when={component() === "TreeViewChild"}>
          <li>
            <PageItemRender metaVertex={field.meta} />
          </li>
        </Match>
        <Match when={component() === "Accordion"}>
          <Accordion {...field.meta.P.props}>
            {field.data?.P[field.meta.P[IdAttr]] ?? field.meta.P.children}
          </Accordion>
        </Match>
        <Match when={component() === "Breadcrumb"}>
          <Breadcrumbs
            separator={field.meta.P.props.separator ?? "›"}
            aria-label="breadcrumb"
            {...field.meta.P.props}
          >
            <PageItemRender metaVertex={field.meta} />
          </Breadcrumbs>
        </Match>
        <Match when={component() === "ProgressBar"}>
          <Progress {...field.meta.P.props} />
        </Match>
        <Match when={component() === "Form"}>
          <FormWrapper meta={field.meta} />
        </Match>
        <Match when={true}>
          <Dynamic
            component={field.meta.P.props?.as || "div"}
            class={getValueFromVertexOrKey(field.meta.P.props, "class")}
          >
            {field.children}
            <PageItemRender metaVertex={field.meta} />
          </Dynamic>
        </Match>
      </Switch>
    </Show>
  );
}
function FormWrapper(props: ComponentProps & {
  submitButton?: any
}) {
  const { Ws } = useContext(WsContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  const { showLoadingToast } = useToast();
  const navigate = useNavigate();

  const cleanUpConfig = {} as { [key: string]: any; };
  const txnId = getNewTxnId(graph, setGraph);
  const [formData, setFormData] = createStore({
    txnId,
    cleanUpConfig: () => cleanUpConfig,
  } as {
    cleanUpConfig: () => { [key: string]: any; };
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

  let dataVertex: Vertex;
  // if (!props.data?.id) {
  const createResult = createForm(
    graph,
    setGraph,
    txnId,
    Ws,
    "FixFormLabel"
  );
  if (createResult.error) return createResult.error;
  dataVertex = createResult.vertex!;
  // } else {
  //   const loadResult = loadForm(graph, props.id);
  //   if (loadResult.error) return loadResult.error;
  //   dataVertex = loadResult.vertex!;
  // }


  // const [divRef, setDivRef] = createSignal<HTMLDivElement>();

  const onSubmit = async () => {
    const data = commitTxn(txnId, Ws);
    await showLoadingToast({
      promise: submitDataCall(data, txnId),
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
          <PageItemRender metaVertex={props.meta} />
        </div>
        <div />

        <div class="flex gap:1">
          <Show
            when={props.submitButton}
            fallback={<GenericField
              meta={{
                P: {
                  component: "Button",
                  props: {
                    children: "Submit",
                    onClick: () => onSubmit,
                  },
                },
              } as any} />}
          >
            {props.submitButton}
          </Show>

          <GenericField
            meta={{
              P: {
                component: "Button",
                props: {
                  onClick: () => onCancel,
                  variant: "outlined",
                  class: "border-color:#FF0000 color:#FF0000",
                  children: "Cancel",
                },
              },
            } as any} />
        </div>
      </FormContext.Provider>
    </div>
  );
}

