import {
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
import { mergeVertexProperties, meta } from "../lib/Vertex";
import { WsContext } from "./ws_events_dispatcher";

import { SelectInputField } from "./input/SelectInputField";
import { TableInputField } from "./input/TableInputField";

import Tabs from "devextreme/ui/tabs";
import { useNavigate } from "@solidjs/router";
import { AbstractSingleForm } from "./Form";
import {
  genericComponents,
  GenericInputField
} from "./input/GenaricInputField";
import {
  getOptionLabel,
  getSelectionOptions,
  getToEdge
} from "../lib/Traverse";
import dxValidationGroup from "devextreme/ui/validation_group";
import dxValidationSummary from "devextreme/ui/validation_summary";
import { GenericField } from "./input/GenaricField";
import {
  FormContext,
  FormMetaData,
  newRow,
  Record
} from "../lib/Record";

// Dynamic Form Component
const FormComponent = (props: {
  meta: Vertex;
  data: Vertex;
  formId: string;
}) => {
  let { record } = useContext(FormContext);
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
    if (record.isRealTime) {
      record.txnId = getNewTxnId();
    }
    newVertex = graph.vertexes[newRow(record.txnId, props.data, `${type}`).vertexId!];
    if (record.isRealTime) commitTxn(record.txnId, Ws);
  } else {
    newVertex = vertexes.vertexes![0];
  }

  return <AbstractSingleForm config={{}} meta={newMeta} formId={props.formId} id={newVertex.id} />;
};

// Dynamic Component used in the form
export const DynamicComponent = (props: {
  id: string;
  component: string;
  meta: Vertex;
  data: Vertex;
  setValue(attribute: Vertex, vertex: Vertex, data: any): void;
  disabled?: boolean;
}) => {
  return (
    <Switch>
      <Match when={!props.component}>NO INPUT</Match>
      <Match when={props.component === "SelectBox" || props.component === "TagBox"}>
        <SelectInputField
         aria-labeledby={props.id}
         data={props.data}
         meta={props.meta}
         // passed setValue when we have a string value in select field
         setValue={props.setValue}
         disabled={props.disabled!}
         component={props.component}
        />
      </Match>
      <Match when={props.component === "Table"}>
        <Show when={!props.disabled} fallback={<>...</>}>
          <TableInputField meta={props.meta} data={props.data}
                           disabled={props.disabled!} />
        </Show>
      </Match>
      <Match when={props.component.startsWith("Form")}>
        <td>
          <div class="flex">
            {props.meta.properties.props?.defaultValue &&
              getOptionLabel(props.data, props.meta.properties.props.defaultValue)}
            <FormComponent meta={props.meta} data={props.data} formId={props.component.slice(4)} />
          </div>
        </td>
      </Match>
      <Match when={props.component} keyed>
        <Show when={genericComponents.includes(props.component)}>
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

interface FormGroupProps {
  attributes: Vertex[];
  vertex: Vertex;
  setValue(attribute: Vertex, vertex: Vertex, data: any): void;
}

// group of the fields
export function FormGroup(props: FormGroupProps) {
  return (
    <For each={props.attributes}>
      {(metaVertex) => {
        const id = props.vertex.id + metaVertex.properties[IdAttr] + "Label";
        const component = createMemo(() => {
          if (metaVertex.properties.component.includes("-")) {
            return getOptionLabel(props.vertex, metaVertex.properties.component);
          } else {
            return metaVertex.properties.component;
          }
        });
        const Label = () => <>{toTitle(metaVertex.properties.displayName || metaVertex.properties[IdAttr])}</>
        const Content = () => <DynamicComponent
         id={id}
         component={component()}
         meta={metaVertex}
         data={props.vertex}
         setValue={props.setValue}
        />
        return (
          <Switch>
            <Match when={component() === "Table"}>
              <h3><Label/></h3>
              <Content/>
            </Match>
            <Match when={component() === "CollectionOption"}>
              <Content/>
            </Match>
            <Match when={true}>
              <div class="dx-field">
                <div class="dx-field-label" id={id}>
                  <Label/>
                </div>
                <div class="dx-field-value">
                  <Content/>
                </div>
              </div>
            </Match>
          </Switch>
        );
      }}
    </For>
  );
}

export interface DynamicFormProps {
  meta?: Vertex;
  form: FormMetaData;
  id?: Id;
  config: { [key: string]: any };
}

function getTabsWidth(group: Vertex[]) {
  return group.filter(
     (attribute) => attribute.properties.component === "Table"
    ).length
     ? "100%"
     : "600px"
}

export const DynamicForm = (props: DynamicFormProps) => {
  const { Ws } = useContext(WsContext);
  const navigate = useNavigate();

  const record = new Record({ form: props.form, ws: Ws });
  if (!props.id) {
    const createResult = record.create();
    if (createResult.error) return createResult.error;
  } else {
    const loadResult = record.load(props.id);
    if (loadResult.error) return loadResult.error;
  }

  // focus first input
  const [divRef, setDivRef] = createSignal<HTMLDivElement>();
  onMount(() => {
    // @ts-ignore
    divRef()?.querySelector?.("input")?.focus();
  });

  let validationGroup: dxValidationGroup;
  props.config["record"] = record;

  const groupByTabsAndGroup  = record.groupByTabsAndGroup();
  const tabs = Object.keys(groupByTabsAndGroup).filter((tab) => tab !== "main");
  const [activeTab, setActiveTab] = createSignal(tabs[0]);

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
  }

  const onCancel = () => {
    revertTransaction(record.txnId);
    setTimeout(() => navigate(-1));
  }

  return (
    <div
      ref={(el) => {
        setDivRef(el);
        validationGroup = new dxValidationGroup(divRef()!);
      }}
    >
      <Show when={divRef()}>
        <FormContext.Provider value={{ record, cleanUpConfig, validationGroup: validationGroup! }}>
          {/* Main Tab is display as top level fields */}
          <Show when={groupByTabsAndGroup["main"]}>
            <For each={Object.keys(groupByTabsAndGroup["main"])}>
              {(group) => (
                <>
                  <div
                    class="dx-fieldset"
                    style={{"max-width": getTabsWidth(groupByTabsAndGroup["main"][group])}}
                  >
                    {/*<div class="dx-fieldset-header">Simple Field Set</div>*/}
                    <FormGroup attributes={groupByTabsAndGroup["main"][group]} vertex={record.vertex} setValue={record.setValue} />
                  </div>
                </>
              )}
            </For>
          </Show>

          <Show when={tabs.length > 0}>
            <div
              ref={(el) => {
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

            <For each={Object.keys(groupByTabsAndGroup[activeTab()])}>
              {(group) => {
                return (
                  <div
                    class="dx-fieldset"
                    style={{"max-width": getTabsWidth(groupByTabsAndGroup[activeTab()][group])}}
                  >
                    <Show when={group !== "main"}>
                      <div class="dx-fieldset-header">{group}</div>
                    </Show>
                    <FormGroup
                      attributes={groupByTabsAndGroup[activeTab()][group]}
                      vertex={record.vertex}
                      setValue={record.setValue}
                    />
                  </div>
                );
              }}
            </For>
          </Show>
          <div ref={(el) => new dxValidationSummary(el, { validationGroup: validationGroup! })} />
          <GenericField
           component={"Button"}
           // useSubmitBehavior is required: https://js.devexpress.com/Demos/WidgetsGallery/Demo/Validation/Overview/jQuery/Light/
           meta={meta({ stylingMode: "contained", width: "120", type: "success", useSubmitBehavior: true, text: "Submit" })}
           onClick={onSubmit}
          />
          <GenericField
           component={"Button"}
           meta={meta({ stylingMode: "contained", width: "120", icon: "back", text: "Cancel" })}
           onClick={onCancel}
          />
        </FormContext.Provider>
      </Show>
    </div>
  );
};
