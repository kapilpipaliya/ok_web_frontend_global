import {
  JSX,
  createContext,
  createMemo,
  createSignal,
  For,
  Match,
  onCleanup,
  onMount,
  Show,
  Switch,
  useContext
} from "solid-js";

import { toTitle } from "case-switcher-js";
import {
  commitTxn,
  getNewTxnId,
  graph,
  Id,
  IdAttr,
  revertTransaction,
  Vertex
} from "../lib/graph";
import { mergeVertexProperties } from "../lib/Vertex";
import { WsContext } from "./ws_events_dispatcher";

import { SelectInputField, setSelectionValue } from "./input/SelectInputField";
import { newRow, TableInputField } from "./input/TableInputField";

import Tabs from "devextreme/ui/tabs";
import { A, G } from "@mobily/ts-belt";
import { useNavigate } from "@solidjs/router";
import { capitalizeFirstLetter } from "../utils/utils";
import { AbstractSingleForm } from "./Form";
import {
  genericComponents,
  GenericInputField
} from "./input/GenaricInputField";
import {
  getChildVertexes,
  getOptionLabel,
  getSelectionOptions,
  getToEdge
} from "../lib/Traverse";
import dxValidationGroup from "devextreme/ui/validation_group";
import dxValidationSummary from "devextreme/ui/validation_summary";
import { GenericField } from "./input/GenaricField";
import { FormMetaData, Record } from "../lib/Record";

export const FormContext = createContext({} as { [key: string]: any });

//'setValue(component,null)'
export function getLabel(input: string) {
  input = input.replaceAll(" ", "");
  input = capitalizeFirstLetter(input);
  // TODO: letter make pascalCase letter
  return input;
}
export function getId(input: string) {
  input = input.replaceAll(" ", "");
  input = (input).toLowerCase();
  // TODO: letter make pascalCase letter
  return input;
}
export function onChangeHandler(txnId: number, formVertex: Vertex, vertex: Vertex, changedFieldAttribute: Vertex) {
  if (!changedFieldAttribute.properties.props?.onchange) return;
  const isNew = formVertex.id < 0;
  try {
    let args = JSON.parse(changedFieldAttribute.properties.props.onchange);
    if (Array.isArray(args)) {
      // args in proper format.
    } else if (G.isObject(args)) {
      // TODO: Find the form is new or edit.
      if (args.new && isNew) {
        args = args.new;
      } else if (args.edit) {
        args = args.edit;
      } else {
        return;
      }
    }

    const attribute = (getSelectionOptions(changedFieldAttribute, "-MetaAttr->MetaAttr").vertexes || []).find(
      (vertex) => vertex.properties[IdAttr] === args[0],
    );
    if (!attribute) {
      return;
    }
    let value = args[1];

    if (value === null) value = undefined;
    if (value === "label") value = getLabel(vertex.properties[changedFieldAttribute.properties[IdAttr]]);
    if (value === "id") value = getId(vertex.properties[changedFieldAttribute.properties[IdAttr]]);
    if (value === "clear") value = null;
    if (attribute.properties.component == "Select" || attribute.properties.component === "Tag") {
      setSelectionValue(txnId, vertex, attribute, value);
    } else {
      mergeVertexProperties(txnId, vertex.id, {
        [attribute.properties[IdAttr]]: value,
      });
    }
  } catch (e) {}
}
const FormComponent = (props: {
  meta: Vertex;
  data: Vertex;
  formId: string;
}) => {
  let { local, txnId, isRealTime } = useContext(FormContext);
  const { Ws } = useContext(WsContext);
  const type = getToEdge(props.meta, props.data) + props.formId;

  const attributes = getSelectionOptions(props.meta, "->MetaAttr");
  const newMeta = attributes.error
    ? graph.vertexes[newRow(getNewTxnId(), props.meta, "MetaAttr").vertexId!]
    : attributes.vertexes![0];
  mergeVertexProperties(getNewTxnId(), newMeta.id, { [IdAttr]: type });

  const vertexes = getSelectionOptions(props.data, `->${type}`);
  let newVertex: any;
  if (vertexes.error) {
    if (isRealTime) {
      txnId = getNewTxnId();
    }
    newVertex = graph.vertexes[newRow(txnId, props.data, `${type}`).vertexId!];
    if (!local && isRealTime) commitTxn(txnId, Ws);
  } else {
    newVertex = vertexes.vertexes![0];
  }

  return <AbstractSingleForm config={{}} meta={newMeta} formId={props.formId} id={newVertex.id} />;
};

export const DynamicComponent = (props: {
  id: string;
  component: string;
  meta: Vertex;
  data: Vertex;
  setValue(attribute: Vertex, data: any): void;
  disabled?: boolean;
}) => {
  return (
    <Switch>
      <Match<boolean> when={!props.component}>NO INPUT</Match>
      <Match<boolean> when={props.component === "SelectBox"}>
        <SelectInputField
         aria-labeledby={props.id}
         data={props.data}
         meta={props.meta}
         // passed setValue when we have a string value in select field
         setValue={props.setValue}
         disabled={props.disabled!}
         component={'SelectBox'}
        />
      </Match>
      <Match<boolean> when={props.component === "TagBox"}>
        <SelectInputField aria-labeledby={props.id} data={props.data} meta={props.meta}
                  // passed setValue when we have a string value in select field
                  setValue={props.setValue}
                  disabled={props.disabled!}
                  component={'TagBox'}
        />
      </Match>
      <Match<boolean> when={props.component === "Table"}>
        <Show<boolean> when={!props.disabled}>
          <TableInputField meta={props.meta} data={props.data}
                           disabled={props.disabled!} />
        </Show>
      </Match>
      <Match<boolean> when={props.component.startsWith("Form")}>
        <td>
          <div class="flex">
            {props.meta.properties.props?.defaultValue &&
              getOptionLabel(props.data, props.meta.properties.props.defaultValue)}
            <FormComponent meta={props.meta} data={props.data} formId={props.component.slice(4)} />
          </div>
        </td>
      </Match>
      <Match<string> when={props.component} keyed>
        <Show<boolean> when={genericComponents.includes(props.component)}>
          <GenericInputField
            aria-labeledby={props.id}
            data={props.data}
            meta={props.meta}
            component={props.component}
            setValue={props.setValue}
            disabled={props.disabled!}
          />
        </Show>
      </Match>
    </Switch>
  );
};

interface DynamicFormProps {
  attributes: Vertex[];
  vertex: Vertex;

  setValue(attribute: Vertex, data: any): void;
}

export function DynamicForm(props: DynamicFormProps) {
  return (
    <For<Vertex[]> each={props.attributes}>
      {(metaVertex) => {
        const id = props.vertex.id + metaVertex.properties[IdAttr] + "Label";
        const component = createMemo(() => {
          if (metaVertex.properties.component.includes("-")) {
            // return getOptionLabel(metaVertex, metaVertex.properties.component);
            return getOptionLabel(props.vertex, metaVertex.properties.component);
          } else {
            return metaVertex.properties.component;
          }
        });
        return (
          <Switch>
            <Match<boolean> when={component() === "Table"}>
              <h3>{toTitle(metaVertex.properties.displayName || metaVertex.properties[IdAttr])}</h3>
              <DynamicComponent
                id={id}
                component={component()}
                meta={metaVertex}
                data={props.vertex}
                setValue={props.setValue}
              />
            </Match>
            <Match<boolean> when={component() === "CollectionOption"}>
              <DynamicComponent
                id={id}
                component={component()}
                meta={metaVertex}
                data={props.vertex}
                setValue={props.setValue}
              />
            </Match>
            <Match<boolean> when={true}>
              <div class="dx-field">
                <div class="dx-field-label" id={id}>
                  {toTitle(metaVertex.properties.displayName || metaVertex.properties[IdAttr])}
                </div>
                <div class="dx-field-value">
                  <DynamicComponent
                    id={id}
                    component={component()}
                    meta={metaVertex}
                    data={props.vertex}
                    setValue={props.setValue}
                  />
                </div>
              </div>
            </Match>
          </Switch>
        );
      }}
    </For>
  );
}

export interface DynamicFormSequenceProps {
  meta?: Vertex;
  form: FormMetaData;
  id?: Id;
  config: { [key: string]: any };
}
export const DynamicFormSequence = (props: DynamicFormSequenceProps) => {
  const { Ws } = useContext(WsContext);
  const navigate = useNavigate();

  const record = new Record({ form: props.form, ws: Ws });
  if (!props.id) {
    const createResult = record.create();
    if (createResult.error) {
      return createResult.error;
    }
  } else {
    const loadResult = record.load(props.id);
    if (loadResult.error) {
      return loadResult.error;
    }
  }

  // focus first input
  const [divRef, setDivRef] = createSignal<HTMLFormElement>();
  let validationGroup;
  onMount(() => {
    // @ts-ignore
    divRef()?.querySelector?.("input")?.focus();
  });

  props.config["record"] = record;
  props.config["vertex"] = record.vertex;
  props.config["meta"] = record.metaVertex;

  const mainAttributes = getChildVertexes(["MetaAttr"], [record.metaVertex]); //.sort((a, b) => a.properties.pos - b.properties.pos);

  const groupByTabs = A.groupBy(mainAttributes.vertexes!, (item) => item.properties.tab!) as unknown as {
    [tab: string]: Vertex[];
  };

  const groupByTabsAndGroup = {} as {
    [tab: string]: { [group: string]: Vertex[] };
  };
  for (const tab in groupByTabs) {
    groupByTabsAndGroup[tab] = A.groupBy(groupByTabs[tab]!, (item) => item.properties.group!) as unknown as {
      [group: string]: Vertex[];
    };
  }

  const tabs = Object.keys(groupByTabs).filter((tab) => tab !== "main");

  const [activeTab, setActiveTab] = createSignal(tabs[0]);

  const cleanUpConfig = {} as { [key: string]: any };

  onCleanup(() => {
    for (const rowMetaTxnId of cleanUpConfig.rowMetaTxnIds || []) {
      revertTransaction(rowMetaTxnId);
    }
  });
  let summery: HTMLDivElement;

  return (
    <div
      ref={(el) => {
        setDivRef(el as HTMLFormElement);
        validationGroup = new dxValidationGroup(divRef()!);
      }}
      class="form"
    >
      <Show<HTMLFormElement> when={divRef()}>
        <FormContext.Provider
          value={{ local: record.form.local, cleanUpConfig, validationGroup, formVertex: record.vertex, isRealTime: record.isRealTime, txnId: record.txnId }}
        >
          {/* Main Tab is display as top level fields */}
          <Show<{[p: string]: Vertex[]}> when={groupByTabsAndGroup["main"]}>
            <For<string[]> each={Object.keys(groupByTabsAndGroup["main"])}>
              {(group) => (
                <>
                  <div
                    class="dx-fieldset"
                    style={{
                      "max-width": groupByTabsAndGroup["main"][group].filter(
                        (attribute) => attribute.properties.component === "Table",
                      ).length
                        ? "100%"
                        : "600px",
                    }}
                  >
                    {/*<div class="dx-fieldset-header">Simple Field Set</div>*/}
                    <DynamicForm attributes={groupByTabsAndGroup["main"][group]} vertex={record.vertex} setValue={record.setValue} />
                  </div>
                </>
              )}
            </For>
          </Show>

          <Show<boolean> when={tabs.length > 0}>
            <div
              ref={(el) => {
                // https://js.devexpress.com/Demos/WidgetsGallery/Demo/Tabs/Overview/jQuery/Light/
                // @ts-ignore
                const tabsInstance = new Tabs(el, {
                  dataSource: tabs,
                  width: 800,
                  scrollByContent: true,
                  showNavButtons: true,
                  selectedIndex: 0,
                  onItemClick(e) {
                    setActiveTab(e.itemData as string);
                  },
                });
                onCleanup(() => tabsInstance.dispose());
              }}
            />

            <For<string[]> each={Object.keys(groupByTabsAndGroup[activeTab()])}>
              {(group) => {
                return (
                  <div
                    class="dx-fieldset"
                    style={{
                      "max-width": groupByTabsAndGroup[activeTab()][group].filter(
                        (attribute) => attribute.properties.component === "Table",
                      ).length
                        ? "100%"
                        : "600px",
                    }}
                  >
                    <Show<boolean> when={group !== "main"}>
                      <div class="dx-fieldset-header">{group}</div>
                    </Show>
                    <DynamicForm
                      attributes={groupByTabsAndGroup[activeTab()][group]}
                      vertex={record.vertex}
                      setValue={record.setValue}
                    />
                  </div>
                );
              }}
            </For>
          </Show>
          <div ref={(el) => new dxValidationSummary(el, { validationGroup })} />
          <GenericField
           component={"Button"}
            meta={
              {
                properties: {
                  name: "meta",
                  props: {
                    stylingMode: "contained",
                    width: "120",
                    type: "success",
                    // below line is required: https://js.devexpress.com/Demos/WidgetsGallery/Demo/Validation/Overview/jQuery/Light/
                    useSubmitBehavior: true,
                  },
                },
              } as unknown as Vertex
            }
            data={{ properties: { meta: "Submit" } } as unknown as Vertex}
            onClick={function (e) {
              const result = validationGroup.validate();
              if (result.isValid) {
                console.log("valid");
                // !!!TODO!!! Handle Error Received From server when commit
                if (!record.form.local && !record.isRealTime) {
                  commitTxn(record.txnId, Ws);
                }
                // currently we are navigating back.
                navigate(-1);
              } else {
                alert("please fix all errors");
              }
            }}
          />
          <GenericField
           component={"Button"}
            meta={
              {
                properties: {
                  [IdAttr]: "meta",
                  props: { stylingMode: "contained", width: "120", icon: "back" },
                },
              } as unknown as Vertex
            }
            data={{ properties: { meta: "Cancel" } } as unknown as Vertex}
            onClick={() => {
              revertTransaction(record.txnId);
              setTimeout(() => navigate(-1));
            }}
          />
        </FormContext.Provider>
      </Show>
    </div>
  );
};
