import {
  createComputed,
  createEffect,
  createMemo, createRenderEffect, createSelector,
  createSignal,
  For,
  getOwner,
  JSXElement,
  Match, on,
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
  IdAttr,
  revertTransaction,
  Vertex,
} from "../../../lib/graph";
import {
  Record,
  FormContext,
  PageContext,
  getSelectionOptions,
  getValueFromVertexOrKey,
} from "../../../lib/Utils";
import { showNav } from "../../../signals/common";
import { getLastItem } from "../../../utils/functions";
import { WsContext } from "../../../utils/ws_events_dispatcher";
import { ComponentProps } from "../../ComponentType";
import { componentDrag } from "../../PageDesignerDragAndDrop";
import { setParentValue } from "../SelectInputField";
import {
  Accordion,
  Avatar,
  Breadcrumbs,
  Button,
  Progress,
  Spinner,
  Tab,
  TabContainer,
  TabList,
  Tabs,
} from "../../solid-blocks/blocks";
import { getParentVertexValue } from "../../../lib/Traverse";
import {
  PageRenderContext,
  PageRenderUtils,
  PageItemRender,
  RepeaterContext,
  getText,
  GlobalDragData,
  getUrl,
  PageView,
} from "../GenaricField";
import { getTextColumnValue } from "./Utils";
import {hoverId, selectedId, setSelectedId} from "../../pageStore";

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
  }
) {
  // @ts-ignore
  const formContext = useContext(FormContext);
  let { events } = useContext(PageContext);
  const parentItems = useContext(PageRenderContext);
  const component = createMemo(() => props.component || props.meta.P.component);
  // @ts-ignore
  const parentComponent = createMemo(() => {
    return PageRenderUtils.getComponent(getLastItem(parentItems, 2))?.P[IdAttr];
  });

  const outerOwner = getOwner();

  const Form = () => {
    const { Ws } = useContext(WsContext);
    const navigate = useNavigate();

    const record = new Record({ ws: Ws });
    const collectionVertex = createMemo(() => {
      return PageRenderUtils.getCollection(getLastItem(parentItems, 1));
    });
    if (!collectionVertex()) return "No Collection Found";
    // const dataVertex =
    if (!props.data?.id) {
      // create new vertex from Collection vertex
      const createResult = record.create(collectionVertex()!);
      if (createResult.error) return createResult.error;
    } else {
      // load data vertex
      const loadResult = record.load(props.data.id);
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
      const result = validationGroup.validate();
      if (result.isValid) {
        console.log("valid");
        // !!!TODO!!! Handle Error Received From server when commit
        if (!record.isRealTime) {
          commitTxn(record.txnId, Ws);
        }
        // currently we are navigating back.
        navigate(-1);
      } else {
        alert("please fix all errors");
      }
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
          <FormContext.Provider value={{ record, cleanUpConfig }}>
            <PageItemRender metaVertex={props.meta} />
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
                        variant: "secondary",
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
  const isSelectedLayoutId = createSelector(selectedId);
  const isSelectedHoverId = createSelector(hoverId);

  return (
    <Show
      when={!props.disabled}
      fallback={getTextColumnValue(props.data?.P[props.meta.P[IdAttr]])}
    >
      <Switch>
        <Match when={component() === "Repeater"}>
          <For
            each={
              props.data ||
              getSelectionOptions(
                [props.meta],
                `g:'${PageRenderUtils.getCollection(props.meta)!}'`
              ).vertexes
            }
          >
            {(vertex) => (
              <RepeaterContext.Provider
                value={[vertex, ...useContext(RepeaterContext)]}
              >
                <PageRenderContext.Provider
                  value={[...useContext(PageRenderContext), props.meta]}
                >
                  <PageItemRender metaVertex={props.meta} data={vertex} />
                </PageRenderContext.Provider>
              </RepeaterContext.Provider>
            )}
          </For>
        </Match>
        <Match when={component() === "Text"}>
          <Show
            when={props.meta.P.props?.as}
            fallback={getText(props.meta.P.props?.text, repeaterContext)}
          >
            <Dynamic
              component={props.meta.P.props?.as}
              class={getValueFromVertexOrKey(props.meta.P.props, "class")}
              draggable
              
              onDragStart={(e) => {
                e.stopPropagation();
                return (GlobalDragData.from = props.meta);
              }}
            >
              {getText(props.meta.P.props?.text, repeaterContext)}
              {props.children}
              <PageItemRender metaVertex={props.meta} />
            </Dynamic>
          </Show>
        </Match>
        <Match when={component() === "A"}>
          <Switch>
            <Match when={PageRenderUtils.getDataVertex(props.meta)}>
              {(vertex) => (
                <A
                  
                  {...props.meta.P.props}
                  href={(showNav() ? "/nav/" : "/") + vertex().P.name}
                  draggable
                >
                  <Show
                    when={!props.meta.P.props?.text}
                    fallback={getText(
                      props.meta.P.props?.text,
                      repeaterContext
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
                href={getUrl(props.meta.P.props.href, repeaterContext)}
                draggable
              >
                <Show
                  when={!props.meta.P.props?.text}
                  fallback={getText(props.meta.P.props?.text, repeaterContext)}
                >
                  {props.children}
                  <PageItemRender metaVertex={props.meta} />
                </Show>
              </A>
            </Match>
            <Match when={true}>
              <a draggable >
                {props.children}
                <PageItemRender metaVertex={props.meta} />
              </a>
            </Match>
          </Switch>
        </Match>

        <Match when={component() === "Page"}>
          {/* g:'Page':-'*[P.name="book"]' */}
          <PageView number={1} vertex={props.data} />
        </Match>
        <Match when={component() === "Image"}>
          <img
            loading="lazy"
            
            {...props.meta.P.props}
            src={getText(props.meta.P.props?.src, repeaterContext)}
            draggable={true}
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
            
            class={getValueFromVertexOrKey(props.meta.P?.props, "class")}
            width={props.meta.P.props?.width || "24"}
            height={props.meta.P.props?.height || "24"}
            {...props.meta.P.props}
          />
        </Match>
        <Match when={component() === "Box" && props.meta.P.props?.text}>
          <Dynamic
            component={props.meta.P.props?.as || "div"}
            
            {...getAttrs(props.meta)}
            class={getValueFromVertexOrKey(props.meta.P.props, "class")}
          >
            {getText(props.meta.P.props?.text, repeaterContext)}
          </Dynamic>
        </Match>
        <Match when={component() === "Button"}>
          <Button
            
            {...props.meta.P.props}
          >
            {props.data?.P[props.meta.P[IdAttr]] ?? props.meta.P.props.children}
          </Button>
        </Match>
        <Match when={component() === "Avtar"}>
          <Avatar
            
            {...props.meta.P.props}
          >
            {props.data?.P[props.meta.P[IdAttr]] ?? props.meta.P.props.children}
          </Avatar>
        </Match>
        {/* <Match when={component() === "Select"}>
              <Select {...props.meta.P.props}>
                {props.data?.P[props.meta.P[IdAttr]] ?? props.meta.P.props.children}
              </Select>
            </Match> */}
        <Match when={component() === "LoadIndicator"}>
          {component()}
          <Spinner
            
            {...props.meta?.P.props}
          >
            {props.meta.P.props.children}
          </Spinner>
        </Match>
        <Match when={component() === "Accordion"}>
          <Accordion
            
            {...props.meta.P.props}
          >
            {props.data?.P[props.meta.P[IdAttr]] ?? props.meta.P.props.children}
          </Accordion>
        </Match>
        <Match when={component() === "Breadcrumb"}>

          <Breadcrumbs separator={props.meta.P.props.separator ?? "›"} aria-label="breadcrumb" 
                       {...props.meta.P.props}>
                       <PageItemRender metaVertex={props.meta} />
          </Breadcrumbs>
        </Match>
        <Match when={component() === "ProgressBar"}>
          <Progress
              
              {...props.meta.P.props}
          />
        </Match>
        <Match when={true}>
          <Dynamic
            component={props.meta.P.props?.as || "div"}
            class={getValueFromVertexOrKey(props.meta.P.props, "class")}
          >
            {props.children}
            <PageItemRender metaVertex={props.meta} />
          </Dynamic>
        </Match>
      </Switch>
    </Show>
  );
}
