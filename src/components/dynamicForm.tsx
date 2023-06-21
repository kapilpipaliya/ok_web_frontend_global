import {
  createMemo,
  createSignal,
  For, JSXElement,
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
import {
  findVertexByLabelAndUniqueId,
  mergeVertexProperties
} from "../lib/Vertex";
import { WsContext } from "./ws_events_dispatcher";

import {
  SelectInputField,
  SelectInputFieldWithAutoProps
} from "./input/SelectInputField";
import {
  TableInputField,
  TableInputFieldWithAutoProps
} from "./input/TableInputField";

import Tabs from "devextreme/ui/tabs";
import { useNavigate } from "@solidjs/router";
import { AbstractSingleForm } from "./Form";
import {
  genericComponents,
  GenericInputField, GenericInputFieldWithAutoProps
} from "./input/GenaricInputField";
import {
  getOptionLabel,
  getSelectionOptions,
  getToEdge
} from "../lib/Traverse";
import dxValidationGroup from "devextreme/ui/validation_group";
import dxValidationSummary from "devextreme/ui/validation_summary";
import {
  genericComponents2,
  GenericField,
  GenericFieldWithAutoProps
} from "./input/GenaricField";
import {
  FormContext,
  FormMetaData, getExportCode, getPkForCollection,
  newRow,
  Record
} from "../lib/Record";
import dxPopup, { Properties as dxPopupProperties } from "devextreme/ui/popup";
import { importNavigation } from "../pages/BackupRestore";
import { AttrsTableData } from "./api";
import { klona } from "klona";
import { stringify } from "yaml";

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
  // component is required, cant refactor it to remove it, because parent component needs it too.
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
            {props.meta.P.props?.defaultValue &&
              getOptionLabel(props.data, props.meta.P.props.defaultValue)}
            <FormComponent meta={props.meta} data={props.data} formId={props.component.slice(4)} />
          </div>
        </td>
      </Match>
      <Match when={genericComponents.includes(props.component) && props.component} keyed>
        <GenericInputField
          data={props.data}
          meta={props.meta}
          component={props.component}
          setValue={props.setValue}
          disabled={props.disabled!}
        />
      </Match>
      <Match when={genericComponents2.includes(props.component) && props.component} keyed>
        <GenericField
          data={props.data}
          meta={props.meta}
          component={props.component}
          setValue={props.setValue}
          disabled={props.disabled!}
        />
      </Match>
    </Switch>
  );
};
// Dynamic Component used in the form
export const DynamicComponentWithAutoPropsSupport = (props: {
  // component is required, cant refactor it to remove it, because parent component needs it too.
  component: string;
  meta: Vertex;
  data: Vertex;
  setValue(attribute: Vertex, vertex: Vertex, data: any): void;
  disabled?: boolean;
}) => {
  return (
    <Switch>
      <Match when={!props.component}>NO INPUT</Match>
      <Match when={props.component === "SelectBox" || props.component === "TagBox"} keyed>
        <SelectInputFieldWithAutoProps
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
          <TableInputFieldWithAutoProps meta={props.meta} data={props.data}
                           disabled={props.disabled!} />
        </Show>
      </Match>
      <Match when={props.component.startsWith("Form")}>
        <td>
          <div class="flex">
            {props.meta.P.props?.defaultValue &&
              getOptionLabel(props.data, props.meta.P.props.defaultValue)}
            <FormComponent meta={props.meta} data={props.data} formId={props.component.slice(4)} />
          </div>
        </td>
      </Match>
      <Match when={genericComponents.includes(props.component) && props.component} keyed>
        <GenericInputFieldWithAutoProps
          data={props.data}
          meta={props.meta}
          component={props.component}
          setValue={props.setValue}
          disabled={props.disabled!}
        />
      </Match>
      <Match when={genericComponents2.includes(props.component) && props.component} keyed>
        <GenericFieldWithAutoProps
          data={props.data}
          meta={props.meta}
          component={props.component}
          setValue={props.setValue}
          disabled={props.disabled!}
        />
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
        const id = props.vertex.id + metaVertex.P[IdAttr] + "Label";
        const component = createMemo(() => {
          if (metaVertex.P.component.includes("-")) {
            return getOptionLabel(props.vertex, metaVertex.P.component);
          } else {
            return metaVertex.P.component;
          }
        });
        const Label = () => <>{toTitle(metaVertex.P.displayName || metaVertex.P[IdAttr])}</>
        const Content = () => <DynamicComponent

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
  submitButton?: JSXElement
}

function getTabsWidth(group: Vertex[]) {
  return group.filter(
     (attribute) => attribute.P.component === "Table"
    ).length
     ? "100%"
     : "600px"
}

export const DynamicForm = (props: DynamicFormProps) => {
  const { Ws } = useContext(WsContext);
  const navigate = useNavigate();

  const record = new Record({ ws: Ws });
  if (!props.id) {
    const createResult = record.create(props.form[IdAttr]);
    if (createResult.error) return createResult.error;
  } else {
    const loadResult = record.load(props.id);
    if (loadResult.error) return loadResult.error;
  }
  record.createMeta(props.form);

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

  const [popup, setPopup] = createSignal(false);
  const [importCode, setImportCode] = createSignal("");
  const importCodeFn = () => {
    // importNavigation(importCode(), record);
  };
  let popupConfig: any;

  const ImportComponent = () => {
    return <textarea class="h:95% w:100%" value={importCode()}
                     onChange={e => setImportCode(e.target.value)} />
  }
  const PreviewCode = () => {
    return <pre>{stringify(getExportCode(record))}</pre>;
  };
  const onImportClick = (data: any) => {
    popupConfig = (instance: () => dxPopup) => ({
      contentTemplate: ImportComponent,
      width: 500,
      height: 500,
      title: 'Import',
      'position.of': data.element,
      toolbarItems: [{
        widget: 'dxButton',
        toolbar: 'bottom',
        location: 'before',
        options: {
          icon: 'import',
          text: 'Import',
          onClick: importCodeFn,
        },
      }, {
        widget: 'dxButton',
        toolbar: 'bottom',
        location: 'after',
        options: {
          text: 'Close',
          onClick() {
            instance().hide();
            setPopup(false);
          },
        },
      }],
    })
    setPopup(true);
  }

  const onExportClick =  (data: any) => {
    popupConfig = (instance: () => dxPopup) => ({
      contentTemplate: PreviewCode,
      width: 500,
      height: 500,
      title: 'Export',
      'position.of': data.element,
      toolbarItems: [{
        widget: 'dxButton',
        toolbar: 'bottom',
        location: 'after',
        options: {
          text: 'Close',
          onClick() {
            instance().hide();
            setPopup(false);
          },
        },
      }],
    })
    setPopup(true);
  }
  const PopOver = () => {
    return <div ref={el => {
      let instance: dxPopup;
      onMount(() => {
        instance = new dxPopup(el, {
          container: '.dx-viewport',
          showTitle: true,
          visible: false,
          dragEnabled: false,
          hideOnOutsideClick: true,
          showCloseButton: false,
          onHidden:() => setPopup(false),
          position: {
            at: 'bottom',
            my: 'center',
            collision: 'fit',
          },
          ...popupConfig(() => instance)
        }  as dxPopupProperties);
        instance.show();
      })
      onCleanup(() => instance.dispose());
    }}/>
  }

  return (
    <div
      ref={(el) => {
        setDivRef(el);
        validationGroup = new dxValidationGroup(divRef()!);
      }}
    >
      <div class="flex gap:10 jc:end">
        <GenericField
         meta={{ P: {component: "Button", props: { stylingMode: "contained", width: "120", text: "Import" }}} as any}
         onClick={onImportClick}
        />
        <GenericField
         meta={{ P: {component: "Button", props: { stylingMode: "contained", width: "120", text: "Export" }}} as any}
         onClick={onExportClick}
        />
      </div>
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

          <div class="flex gap:10">
            <Show when={props.submitButton} fallback={<GenericField
             // useSubmitBehavior is required: https://js.devexpress.com/Demos/WidgetsGallery/Demo/Validation/Overview/jQuery/Light/
             meta={{ P: {component: "Button", props: { stylingMode: "contained", width: "120", type: "success", useSubmitBehavior: true, text: "Submit" }}} as any}
             onClick={onSubmit}
            />}>
              {props.submitButton}
            </Show>

            <GenericField
             meta={{ P: {component: "Button", props: { stylingMode: "contained", width: "120", type: "danger", icon: "back", text: "Cancel" }}} as any}
             onClick={onCancel}
            />
          </div>
        </FormContext.Provider>
      </Show>
      <Show when={popup()}><PopOver/></Show>
    </div>
  );
};
