import {
  createMemo,
  createSignal,
  For,
  JSXElement,
  Match,
  onCleanup,
  Show,
  Switch,
  useContext,
} from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { A, useNavigate } from "@solidjs/router";
import { Dynamic } from "solid-js/web";
import {
  commitTxn,
  GraphContext,
  IdAttr,
  revertTransaction,
  Vertex,
} from "../../lib/graph";
import {
  Record,
  FormContext,
  getSelectionOptions,
  getTextColumnValue,
  getValueFromVertexOrKey,
  getChildVertexes,
  APP_BASE_URL,
} from "../../lib/Utils";
import { getLastItem } from "../../lib/functions";
import { WsContext } from "../../lib/ws_events_dispatcher";
import { ComponentProps } from "../../lib/ComponentType";
import {
  Accordion,
  Avatar,
  Breadcrumbs,
  Progress,
  Spinner,
  Tabs,
} from "../solid-blocks/blocks";
import {
  PageRenderContext,
  PageRenderUtils,
  PageItemRender,
  RepeaterContext,
  getText,
  getUrl,
  PageView,
} from "./GenaricField";
import CustomButton from "../solid-blocks/blocks/buttons";
import TreeView from "../solid-blocks/blocks/treeview";
import { Collapsible } from "../solid-blocks/blocks/collapsible";

// This component support rendering Child Themselves by calling PageRender.
function getAttrs(meta: Vertex) {
  if (meta.P.props?.attr) {
    return JSON.parse(meta.P.props?.attr);
  } else {
    return {};
  }
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
  const { data, meta, disabled, children } = props;
  // @ts-ignore
  const formContext = useContext(FormContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  const parentItems = useContext(PageRenderContext);
  const component = createMemo(() => props.component || meta.P.component);
  // @ts-ignore
  const parentComponent = createMemo(() => {
    return PageRenderUtils.getComponent(graph, getLastItem(parentItems, 2))?.P[
      IdAttr
    ];
  });

  const Form = () => {
    const { Ws } = useContext(WsContext);
    const navigate = useNavigate();

    const record = new Record({ ws: Ws });
    const collectionVertex = createMemo(() => {
      return PageRenderUtils.getCollection(graph, getLastItem(parentItems, 1));
    });
    if (!collectionVertex()) return "No Collection Found";
    // const dataVertex =
    if (!data?.id) {
      // create new vertex from Collection vertex
      const createResult = record.create(graph, setGraph, collectionVertex()!);
      if (createResult.error) return createResult.error;
    } else {
      // load data vertex
      const loadResult = record.load(graph, data.id);
      if (loadResult.error) return loadResult.error;
    }

    const [divRef, setDivRef] = createSignal<HTMLDivElement>();

    // let validationGroup: dxValidationGroup;
    // letter if we need a record, write a solution.
    // but we should not need to access record,
    // everything will be configured from json.
    // props.config["record"] = record;
    const cleanUpConfig = {} as { [key: string]: any };

    onCleanup(() => {
      for (const rowMetaTxnId of cleanUpConfig.rowMetaTxnIds || [])
        revertTransaction(rowMetaTxnId);
    });

    const onSubmit = () => {
      // todo fix validations
      // const result = validationGroup.validate();
      // if (result.isValid) {
      //     console.log("valid");
      //     // !!!TODO!!! Handle Error Received From server when commit
      //     if (!record.isRealTime) {
      //         commitTxn(record.txnId, Ws);
      //     }
      //     // currently we are navigating back.
      //     navigate(-1);
      // } else {
      //     alert("please fix all errors");
      // }
    };

    const onCancel = () => {
      revertTransaction(record.txnId);
      setTimeout(() => navigate(-1));
    };

    return (
      <div
        ref={(el) => {
          setDivRef(el);
          // validationGroup = new dxValidationGroup(divRef()!);
        }}
      >
        <Show when={divRef()}>
          <FormContext.Provider value={{ record, cleanUpConfig } as any}>
            <PageItemRender metaVertex={meta} />
            {/* @ts-ignore */}
            <div />

            <div class="flex gap:1">
              <Show
                when={props.submitButton}
                fallback={
                  <GenericField
                    // useSubmitBehavior is required: https://js.devexpress.com/Demos/WidgetsGallery/Demo/Validation/Overview/jQuery/Light/
                    meta={
                      {
                        P: {
                          component: "Button",
                          props: {
                            children: "Submit",
                            onClick: () => onSubmit,
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
                        onClick: () => onCancel,
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
        </Show>
      </div>
    );
  };

  const repeaterContext = useContext(RepeaterContext);

  return (
    <Show
      when={!disabled}
      fallback={getTextColumnValue(data?.P[meta.P[IdAttr]])}
    >
      <Switch>
        <Match when={component() === "Repeater"}>
          <For
            each={
              data ||
              getSelectionOptions(
                graph,
                setGraph,
                [meta],
                `g:'${PageRenderUtils.getCollection(graph, meta)!}'`,
              ).vertexes
            }
          >
            {(vertex) => (
              <RepeaterContext.Provider
                value={[vertex, ...useContext(RepeaterContext)]}
              >
                <PageRenderContext.Provider
                  value={[...useContext(PageRenderContext), meta]}
                >
                  <PageItemRender metaVertex={meta} data={vertex} />
                </PageRenderContext.Provider>
              </RepeaterContext.Provider>
            )}
          </For>
        </Match>
        <Match when={component() === "Text"}>
          <Show
            when={meta.P.props?.as}
            fallback={getText(
              graph,
              setGraph,
              meta.P.props?.text,
              repeaterContext,
            )}
          >
            <Dynamic
              component={meta.P.props?.as}
              class={getValueFromVertexOrKey(meta.P.props, "class")}
            >
              {getText(graph, setGraph, meta.P.props?.text, repeaterContext)}
              {children}
              <PageItemRender metaVertex={meta} />
            </Dynamic>
          </Show>
        </Match>
        <Match when={component() === "A"}>
          <Switch>
            <Match when={PageRenderUtils.getDataVertex(graph, meta)}>
              {(vertex) => (
                <A
                  {...meta.P.props}
                  href={`${APP_BASE_URL}/` + vertex().P.name}
                  draggable
                >
                  <Show
                    when={!meta.P.props?.text}
                    fallback={getText(
                      graph,
                      setGraph,
                      meta.P.props?.text,
                      repeaterContext,
                    )}
                  >
                    {children}
                    <PageItemRender metaVertex={meta} />
                  </Show>
                </A>
              )}
            </Match>
            <Match when={meta.P.props?.href}>
              <A
                {...meta.P.props}
                href={getUrl(graph, setGraph, meta.P.href, repeaterContext)}
                draggable
              >
                <Show
                  when={!meta.P.props?.text}
                  fallback={getText(
                    graph,
                    setGraph,
                    meta.P.props?.text,
                    repeaterContext,
                  )}
                >
                  {children}
                  <PageItemRender metaVertex={meta} />
                </Show>
              </A>
            </Match>
            <Match when={true}>
              <a draggable>
                {children}
                <PageItemRender metaVertex={meta} />
              </a>
            </Match>
          </Switch>
        </Match>

        <Match when={component() === "Page"}>
          {/* g:'Page':-'*[P.name="book"]' */}
          <PageView number={1} vertex={data} />
        </Match>
        <Match when={component() === "Image"}>
          <img
            loading="lazy"
            {...meta.P.props}
            src={getText(graph, setGraph, meta.P.props?.src, repeaterContext)}
            draggable={true}
            alt={"img"}
          />
        </Match>
        <Match when={component() === "Tabs"}>
          <Tabs {...meta.P.props}>
            <PageItemRender metaVertex={meta} />
          </Tabs>
        </Match>
        <Match when={component() === "TabContainer"}>
          <PageItemRender metaVertex={meta} />
        </Match>
        <Match when={component() === "TabList"}>
          <PageItemRender metaVertex={meta} />
        </Match>
        <Match when={component() === "Icon"}>
          <Icon
            icon={meta.P.props?.icon}
            class={getValueFromVertexOrKey(meta.P?.props, "class")}
            width={meta.P.props?.width || "24"}
            height={meta.P.props?.height || "24"}
            {...meta.P.props}
          />
        </Match>
        <Match when={component() === "Box" && meta.P.props?.text}>
          <Dynamic
            component={meta.P.props?.as || "div"}
            {...getAttrs(meta)}
            class={getValueFromVertexOrKey(meta.P.props, "class")}
          >
            {getText(graph, setGraph, meta.P.props?.text, repeaterContext)}
          </Dynamic>
        </Match>
        <Match when={component() === "Button"}>
          <CustomButton {...meta.P.props}>
            {data?.P[meta.P[IdAttr]] ?? meta.P.children}
          </CustomButton>
        </Match>
        <Match when={component() === "Table"}>
          <table {...meta.P.props}>
            <PageItemRender metaVertex={meta} />
          </table>
        </Match>
        <Match
          when={
            component() === "TableHeader" &&
            getChildVertexes(graph, ["Attr"], [meta]).vertexes?.length
          }
        >
          <thead class={"r:5|5|5|5"}>
            <tr class={"p:10 text:center h:5"}>
              <PageItemRender metaVertex={meta} />
            </tr>
          </thead>
        </Match>
        <Match when={component() === "TableRow"}>
          <tbody>
            <tr class={"h:50 text:center bg:#ffffff b:1px|solid|#000"}>
              <PageItemRender metaVertex={meta} />
            </tr>
          </tbody>
        </Match>
        <Match when={component() === "Collapsible"}>
          <Collapsible {...meta.P.props}>
            <PageItemRender metaVertex={meta} />
          </Collapsible>
        </Match>
        <Match when={component() === "Avtar"}>
          <Avatar {...meta.P.props}>
            {data?.P[meta.P[IdAttr]] ?? meta.P.children}
          </Avatar>
        </Match>
        {/* <Match when={component() === "Select"}>
              <Select {...props.meta.P.props}>
                {props.data?.P[props.meta.P[IdAttr]] ?? props.meta.P.props.children}
              </Select>
            </Match> */}
        <Match when={component() === "LoadIndicator"}>
          <Spinner {...meta?.P.props}>{meta.P.children}</Spinner>
        </Match>
        <Match when={component() === "TreeViewItem"}>
          <TreeView title={meta.P?.props["title"] ?? "MenuItem"} meta={meta}>
            <PageItemRender metaVertex={meta} />
          </TreeView>
        </Match>
        <Match when={component() === "TreeViewChild"}>
          <li>
            <PageItemRender metaVertex={meta} />
          </li>
        </Match>
        <Match when={component() === "Accordion"}>
          <Accordion {...meta.P.props}>
            {data?.P[meta.P[IdAttr]] ?? meta.P.children}
          </Accordion>
        </Match>
        <Match when={component() === "Breadcrumb"}>
          <Breadcrumbs
            separator={meta.P.props.separator ?? "›"}
            aria-label="breadcrumb"
            {...meta.P.props}
          >
            <PageItemRender metaVertex={meta} />
          </Breadcrumbs>
        </Match>
        <Match when={component() === "ProgressBar"}>
          <Progress {...meta.P.props} />
        </Match>
        <Match when={true}>
          <Dynamic
            component={meta.P.props?.as || "div"}
            class={getValueFromVertexOrKey(meta.P.props, "class")}
          >
            {children}
            <PageItemRender metaVertex={meta} />
          </Dynamic>
        </Match>
      </Switch>
    </Show>
  );
}
