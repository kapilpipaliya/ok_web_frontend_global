import {
  createComputed,
  createContext,
  createMemo,
  createSignal,
  For,
  getOwner,
  JSXElement,
  Match,
  onCleanup,
  runWithOwner,
  Show,
  Switch,
  useContext,
} from "solid-js";

// Comment This Lines in web build
import dxValidationGroup from "devextreme/ui/validation_group";
import dxValidationSummary from "devextreme/ui/validation_summary";

import { Icon } from "@iconify-icon/solid";
import { Link, useNavigate } from "@solidjs/router";
import { toTitle } from "case-switcher-js";
import { Dynamic } from "solid-js/web";
import { commitTxn, IdAttr, revertTransaction, setGraph, Vertex } from "../../lib/graph";
import { FormContext, getCollAttrComp, getCompProps, getRowProps, PageContext, Record } from "../../lib/Record";
import { getChildVertex, getChildVertexes, getSelectionOptions } from "../../lib/Traverse";
import { selectedLayout } from "../../pages/PageView";
import { showNav } from "../../signals/common";
import { getLastItem } from "../../utils/functions";
import { getValueFromVertexOrKey, isObject } from "../../utils/utils";
import { WsContext } from "../../utils/ws_events_dispatcher";
import { ComponentProps } from "../ComponentType";
import { DynamicComponent } from "../DynamicForm";
import { mountComponent } from "./MountDevExtremeComp";

// Do not specify the items property if you specified the dataSource, and vice versa.
// It's best to use dataSource but we are using items for simplicity.

export const PageRenderContext = createContext([] as Vertex[]);
export const RepeaterContext = createContext([] as Vertex[]); // DataVertex[]

export const PageRenderUtils = {
  getCollection: (item?: Vertex): string | undefined => item && getChildVertex(["$0Coll"], item).vertex?.P[IdAttr],
  getAttrVertex: (item?: Vertex): Vertex | undefined => item && getChildVertex(["$0Att"], item).vertex,
  getAttr: (item?: Vertex): string | undefined => item && PageRenderUtils.getAttrVertex(item)?.P[IdAttr],
  getID: (item?: Vertex): string | undefined => item && item.P["name"],
  getId: (item?: Vertex): string | undefined => PageRenderUtils.getAttr(item) || PageRenderUtils.getID(item) || "",
  // get component or Attribute component
  getComponent: (item?: Vertex): Vertex | undefined => {
    if (!item) return;

    const currentComp = getChildVertex(["$0Comp"], item).vertex;
    if (currentComp) return currentComp;

    const attrVertex = PageRenderUtils.getAttrVertex(item);
    if (!attrVertex) return;
    return getCollAttrComp(attrVertex);
  },
  getDataVertex: (item?: Vertex) => item && getChildVertex(["$0Data"], item).vertex,
};

export const PageItemRender = (props: { metaVertex: Vertex; data?: Vertex }) => {
  const parentItems = useContext(PageRenderContext);
  // @ts-ignore
  let { record, cleanUpConfig } = useContext(FormContext);

  // children:
  return (
    <For each={getChildVertexes(["Attr"], [props.metaVertex]).vertexes?.sort((a, b) => a.P.pos - b.P.pos)}>
      {(item) => {
        // createComputed is hard to debug
        createComputed(() => {
          // @Note:(Question)
          // We may need to link vertex with meta,
          // so each vertex can identify its meta.

          // 1. this will re-render when Props length changes.
          // 2. when Prop Key changes.
          const componentVertex = PageRenderUtils.getComponent(item);
          const componentProps = componentVertex ? getCompProps(componentVertex) : {};
          const rowProps = getRowProps(item);
          const compProps = Object.assign(componentProps, rowProps);
          if (selectedLayout().vertexId === item.id) {
            if (compProps.class) {
              compProps.class += ` b:red|1px|dashed`;
            } else {
              compProps.class = `b:red|1px|dashed`;
            }
          }

          // supported deleted properties.
          // mergeProperties only merge top level properties. so props will be replaced.
          setGraph("vertexes", item.id, "P", { props: compProps, name: PageRenderUtils.getId(item) });
          // untrack(() => { mergeVertexProperties(getNewTxnId(), item.id, { props: compProps }); })
        });

        const component = createMemo(() => item.P.component || PageRenderUtils.getComponent(item)?.P[IdAttr]);
        const parentComponent = createMemo(() => {
          return PageRenderUtils.getComponent(getLastItem(parentItems, 1))?.P[IdAttr];
        });
        // TODO: Is This Parent Vertex is ok?
        // Need Repetitive parent checks?
        // @ts-ignore
        const parentData = () => {
          return PageRenderUtils.getDataVertex(getLastItem(parentItems, 1));
        };

        const PageComponent = () => (
          <PageRenderContext.Provider value={[...useContext(PageRenderContext), item]}>
            <DynamicComponent
              meta={item}
              // NOTE: For repeater we cant use parentData
              // data={props.data || getSelectionOptions([...useContext(RepeaterContext)], item.P.data).vertexes || PageRenderUtils.getDataVertex(item) || parentData()}
              data={
                props.data ||
                getSelectionOptions([...useContext(RepeaterContext)], item.P.data).vertexes ||
                PageRenderUtils.getDataVertex(item)
              }
              setValue={record?.setValue || (() => {})}
              disabled={false}
              component={component()}
            />
          </PageRenderContext.Provider>
        );
        // currently context is not reactive, but we are assuming it will work.

        const Label = () => {
          return <>{toTitle(PageRenderUtils.getId(item) || "")}</>;
        };

        return (
          <Switch>
            {/* when the parent Component is FieldSetLabelLeft,
        we add label automatically */}
            <Match when={parentComponent() === "FieldSetLabelLeft"}>
              <Switch>
                <Match when={component() === "Table"}>
                  <h3>
                    <Label />
                  </h3>
                  <PageComponent />
                </Match>
                <Match when={component() === "CollectionOption"}>
                  <PageComponent />
                </Match>
                <Match when={true}>
                  <div class="dx-field">
                    <div class="dx-field-label">
                      <Label />
                    </div>
                    <div class="dx-field-value">
                      <PageComponent />
                    </div>
                  </div>
                </Match>
              </Switch>
            </Match>
            <Match when={true}>
              <PageComponent />
            </Match>
          </Switch>
        );
      }}
    </For>
  );
};
// Do not specify the items property if you specified the dataSource, and vice versa.
// It's best to use dataSource, but we are using items for simplicity.
// Components that don't have children.
export const getTextColumnValue = (value: any) => {
  if (value === true) {
    return "True";
  } else if (value === false) {
    return "False";
  }
  if (!value) {
    return "";
  }

  if (Array.isArray(value)) {
    const values = [];
    for (const v of value) {
      values.push(getTextColumnValue(v));
    }
    value = values.join(", ");
  }

  return isObject(value) ? JSON.stringify(value) : value;
};

// This component support rendering Child Themselves by calling PageRender.
export function GenericField(
  props: ComponentProps & {
    component?: string;
    disabled?: boolean;
    txnId?: number;
    children?: JSXElement;
    [key: string]: any;
  },
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

    let validationGroup: dxValidationGroup;
    // letter if we need a record, write a solution.
    // but we should not need to access record,
    // everything will be configured from json.
    // props.config["record"] = record;

    const cleanUpConfig = {} as { [key: string]: any };

    onCleanup(() => {
      for (const rowMetaTxnId of cleanUpConfig.rowMetaTxnIds || []) revertTransaction(rowMetaTxnId);
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
          validationGroup = new dxValidationGroup(divRef()!);
        }}
      >
        <Show when={divRef()}>
          <FormContext.Provider value={{ record, cleanUpConfig, validationGroup: validationGroup! }}>
            <PageItemRender metaVertex={props.meta} />
            {/* @ts-ignore */}
            <div ref={(el) => new dxValidationSummary(el, { validationGroup: validationGroup! })} />

            <div class="flex gap:10">
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
                            stylingMode: "contained",
                            width: "120",
                            type: "success",
                            useSubmitBehavior: true,
                            text: "Submit",
                          },
                        },
                      } as any
                    }
                    onClick={onSubmit}
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
                      props: { stylingMode: "contained", width: "120", type: "danger", icon: "back", text: "Cancel" },
                    },
                  } as any
                }
                onClick={onCancel}
              />
            </div>
          </FormContext.Provider>
        </Show>
      </div>
    );
  };

  const repeaterContext = useContext(RepeaterContext);
  return (
    <Show when={!props.disabled} fallback={getTextColumnValue(props.data?.P[props.meta.P[IdAttr]])}>
      <Switch>
        <Match when={component() === "Repeater"}>
          <For
            each={
              props.data ||
              getSelectionOptions([props.meta], `g:'${PageRenderUtils.getCollection(props.meta)!}'`).vertexes
            }
          >
            {(vertex) => (
              <RepeaterContext.Provider value={[vertex, ...useContext(RepeaterContext)]}>
                <PageRenderContext.Provider value={[...useContext(PageRenderContext), props.meta]}>
                  <PageItemRender metaVertex={props.meta} data={vertex} />
                </PageRenderContext.Provider>
              </RepeaterContext.Provider>
            )}
          </For>
        </Match>
        <Match when={component() === "Text"}>
          <Show when={props.meta.P.props?.as} fallback={getText(props.meta.P.props?.text, repeaterContext)}>
            <Dynamic component={props.meta.P.props?.as} class={getValueFromVertexOrKey(props.meta.P.props, "class")}>
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
                <Link {...props.meta.P.props} href={(showNav() ? "/nav/" : "/") + vertex().P.name}>
                  <Show when={!props.meta.P.props?.text} fallback={getText(props.meta.P.props?.text, repeaterContext)}>
                    {props.children}
                    <PageItemRender metaVertex={props.meta} />
                  </Show>
                </Link>
              )}
            </Match>
            <Match when={props.meta.P.props?.href}>
              <Link {...props.meta.P.props} href={getUrl(props.meta.P.props.href, repeaterContext)}>
                <Show when={!props.meta.P.props?.text} fallback={getText(props.meta.P.props?.text, repeaterContext)}>
                  {props.children}
                  <PageItemRender metaVertex={props.meta} />
                </Show>
              </Link>
            </Match>
            <Match when={true}>
              <a>
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
          <img loading="lazy" {...props.meta.P.props} src={getText(props.meta.P.props?.src, repeaterContext)} />
        </Match>
        <Match when={component() === "Form"}>
          <Form />
        </Match>
        <Match when={component() === "Icon"}>
          <Icon
            icon={getText(props.meta.P.props?.icon, repeaterContext)}
            class={getValueFromVertexOrKey(props.meta.P.props, "class")}
            width={props.meta.P.props?.width || "24"}
            height={props.meta.P.props?.height || "24"}
          />
        </Match>
        <Match when={component() === "FieldSetLabelLeft"}>
          <div
            class="dx-fieldset"
            // style={{"max-width": getTabsWidth(groupByTabsAndGroup["main"][group])}}
          >
            {/*<div class="dx-fieldset-header">Simple Field Set</div>*/}
            <PageItemRender metaVertex={props.meta} />
            {/*<FormGroup attributes={groupByTabsAndGroup["main"][group]} vertex={record.vertex} setValue={record.setValue} />*/}
          </div>
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
        <Match when={true}>
          <Dynamic
            component={props.meta.P.props?.as || "div"}
            class={getValueFromVertexOrKey(props.meta.P.props, "class")}
            ref={(el: any) => {
              if (["Box"].includes(component())) return;
              runWithOwner(outerOwner, () => {
                mountComponent(
                  el,
                  component(),
                  props.meta,
                  props.data,
                  props.setValue!,
                  outerOwner!,
                  props.disabled!,
                  props.ref,
                  props.onClick,
                  events,
                );
              });
            }}
          >
            <Switch>
              <Match when={component() === "Drawer"}>
                {/* Min Height is set because drawer cant see height initially*/}
                <div style={"min-height: 506px"}>
                  {props.children}
                  <PageItemRender metaVertex={props.meta} />
                </div>
              </Match>
              <Match when={true}>
                {props.children}
                <PageItemRender metaVertex={props.meta} />
              </Match>
            </Switch>
          </Dynamic>
        </Match>
      </Switch>
    </Show>
  );
}

function getText(projection: string, repeaterContext: Vertex[]) {
  return getSelectionOptions(repeaterContext, projection).vertexes as string;
}

function getUrl(projection: string, repeaterContext: Vertex[]) {
  let url = getSelectionOptions(repeaterContext, projection).vertexes as string | undefined;
  if (typeof url === "string" && url.startsWith("/")) {
    // url = (showNav() ? '/nav' : '') + url;
  }
  return url;
}

export function PageView(props: {
  number: number;
  vertex?: Vertex;
}) {
  const collection = createMemo(() => PageRenderUtils.getCollection(props.vertex));
  const dataVertex = createMemo(() => PageRenderUtils.getDataVertex(props.vertex));

  return (
    <PageContext.Provider value={{ events: {} }}>
      <Show when={props.number && props.vertex && props.number} keyed>
        <Switch>
          <Match when={collection() && !dataVertex()}>
            <For each={getSelectionOptions([props.vertex!], `'g:${collection()!}'`).vertexes}>
              {(vertex) => (
                <PageRenderContext.Provider value={[props.vertex!]}>
                  <PageItemRender metaVertex={props.vertex!} data={vertex} />
                </PageRenderContext.Provider>
              )}
            </For>
          </Match>
          <Match when={collection() && dataVertex()}>
            <PageItemRender metaVertex={props.vertex!} />
          </Match>
          <Match when={true}>
            <PageItemRender metaVertex={props.vertex!} />
          </Match>
        </Switch>
      </Show>
    </PageContext.Provider>
  );
}

export function getAttrs(meta: Vertex) {
  if (meta.P.props?.attr) {
    return JSON.parse(meta.P.props?.attr);
  } else {
    return {};
  }
}
