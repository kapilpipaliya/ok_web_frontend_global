import {
  createMemo,
  createSignal,
  For,
  JSXElement,
  Match,
  onCleanup,
  onMount,
  Show,
  splitProps,
  Switch,
  useContext
} from "solid-js";
import {SetStoreFunction, Store} from "solid-js/store";
import {toTitle} from "case-switcher-js";
import {commitTxn, graph, Id, IdAttr, revertTransaction, txnHasSteps, Vertex} from "../lib/graph";
import {WsContext} from "../utils/ws_events_dispatcher";

import {SelectInputField,} from "./input/SelectInputField";
import {TableInputField,} from "./input/TableInputField";
// Comment This Lines in web build
import Tabs from "devextreme/ui/tabs";
import dxValidationGroup from "devextreme/ui/validation_group";
import dxValidationSummary from "devextreme/ui/validation_summary";
import dxPopup, {Properties as dxPopupProperties} from "devextreme/ui/popup";
import {BeforeLeaveEventArgs, useBeforeLeave, useNavigate} from "@solidjs/router";
import {GenericInputField,} from "./input/GenaricInputField";
import {getSelectionOptions,} from "../lib/Traverse";
import {GenericField, RepeaterContext} from "./input/GenaricField";
import {FormContext, FormMetaData, getCollAttrComp, getExportCode, getFormMetaData, Record} from "../lib/Record";
import {stringify} from "yaml";
import {getPermissions} from "../lib/auth";

const genericComponents = [
  "Autocomplete",
  "Bullet",
  "Calendar",
  "CheckBox",
  "CircularGauge",
  "ColorBox",
  "DateBox",
  "DropDownBox",
  "FileUploader",
  "FilterBuilder",
  "HtmlEditor",
  "LinearGauge",
  "NumberBox",
  "ProgressBar",
  "RadioGroup",
  "RangeSelector",
  "RangeSlider",
  "SelectBox",
  "Slider",
  "Switch",
  // "TagBox", // giving error with undefined values
  "TextArea",
  "TextBox",
];
import { Register } from "./staticPages/Registration";
import { Login } from "./staticPages/Login";

const genericComponents2 = [
  "Box",
  "TreeMap",
  "VectorMap",
  "TreeView",
  "TreeList",
  "Toast",
  "TileView",
  "Tabs",
  "TabPanel",
  "SpeedDialAction",
  "SparkLine",
  "ScrollView",
  "Scheduler",
  "Sankey",
  "Popup",
  "PopOver",
  "PolarChart",
  "PieChart",
  "MultiView",
  // "SelectBox",
  "Menu",
  "Map",
  // "TagBox",
  "Lookup",
  "LoadPanel",
  "LoadIndicator",
  "List",
  "Gantt",
  "Gallery",
  "Funnel",
  "FileManager",
  "Diagram",
  "DataGrid",
  "ContextMenu",
  "Chart",
  "Button",
  "BarGauge",
  "ActionSheet",
  "Accordion",
  "ButtonGroup",
  "Tooltip",
  "PivotGrid",
  "DropDownButton",
  "Drawer",
  // "FilterBuilder",
  // "FileUploader",
  "FieldSetLabelLeft",
  "Form",
  "DropDownBoxTreeView",
  "Text",
  "Repeater",
  "A",
  "Image",
  "Page",
  "Icon"
]
interface AbstractSingleFormProps extends Omit<DynamicFormProps, "form" | "id"> {
  formId: string;
  id: string | number;
}

export const AbstractSingleForm = (props: AbstractSingleFormProps) => {
  // TODO: add validation on form that AttrsTableData keys should not available.

  const form = getFormMetaData(props.formId);
  if (form.error) return form.error;

  const [p, customProps] = splitProps(props, ["formId", "id"]);

  const id = createMemo(() => (p.id === "new" ? undefined : parseInt(p.id as string)));
  return (
   <div class="">
     <DynamicForm form={form.form!} id={id() as Id} {...customProps}
                  config={props.config || []} />
   </div>
  );
};

// Dynamic Component used in the form
export const DynamicComponent = (props: {
  // component is required, cant refactor it to remove it, because parent component needs it too.
  component: string;
  meta: Vertex;
  data?: Vertex;
  setValue(attribute: Vertex, vertex: Vertex, data: any): void;
  disabled?: boolean;
  isRealTime?: boolean;
  txnId?: number;
}) => {
  return (
    <Switch>
      <Match when={!props.component}>NO INPUT</Match>
      <Match when={props.component === "SelectBox" || props.component === "TagBox"} keyed>
        <SelectInputField
         data={props.data}
         meta={props.meta}
         // passed setValue when we have a string value in select field
         setValue={props.setValue}
         disabled={props.disabled!}
         component={props.component}
         txnId={props.txnId}
         isRealTime={props.isRealTime}
        />
      </Match>
      <Match when={props.component === "Table"}>
        <Show when={!props.disabled} fallback={<>...</>}>
          <TableInputField meta={props.meta} data={props.data}
                           disabled={props.disabled!}
                           txnId={props.txnId}
                           setValue={props.setValue}
                           isRealTime={props.isRealTime}
          />
        </Show>
      </Match>
      <Match when={genericComponents.includes(props.component) && props.component} keyed>
        <GenericInputField
          data={props.data}
          meta={props.meta}
          txnId={props.txnId}
          component={props.component}
          setValue={props.setValue}
          disabled={props.disabled!}
        />
      </Match>
      <Match when={genericComponents2.includes(props.component) && props.component} keyed>
        <GenericField
          data={props.data}
          meta={props.meta}
          txnId={props.txnId}
          component={props.component}
          setValue={props.setValue}
          disabled={props.disabled!}
        />
      </Match>
    </Switch>
  );
};

interface FormGroupProps {
  metaAttributes: Vertex[];
  vertex: Vertex;
  setValue(attribute: Vertex, vertex: Vertex, data: any): void;
  txnId: number;
  isLoginRegister?:string
}

export function getComponentForCollRow(metaVertex: Vertex, data: Vertex) {
    if (!metaVertex.P.component) {
      return getCollAttrComp(metaVertex)?.P[IdAttr];
    } else if (metaVertex.P.component.includes("-")) {
      return getSelectionOptions([data], metaVertex.P.component).vertexes;
    } else {
      return metaVertex.P.component as string;
    }
}

// group of the fields
export function FormGroup(props: FormGroupProps) {
  return (
    <For each={props.metaAttributes}>
      {(metaVertex) => {
        const id = props.vertex.id + metaVertex.P[IdAttr] + "Label";
        const component = createMemo(() => getComponentForCollRow(metaVertex, props.vertex));
        const Label = () => <>{toTitle(metaVertex.P.displayName || metaVertex.P[IdAttr] || metaVertex.P.key || '')}</>
        const Content = () => <DynamicComponent
         component={component()}
         meta={metaVertex}
         data={props.vertex}
         setValue={props.setValue}
          // disabled={props.d}
         txnId={props.txnId}
         isRealTime={false}
        />
        const permissions = metaVertex.P.metaId ? getPermissions(graph.vertexes[metaVertex.P.metaId]) : getPermissions(metaVertex);
        console.log(permissions)
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
              <div class=" grid-cols:2 py:5 w:450">
                <div  id={id}>
                  <Label />
                </div>
                <div class="	">
                  <Content />
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
  config: [Store<{ [key: string]: any }>, SetStoreFunction<{ [key: string]: any }>];
  submitButton?: JSXElement
  importExportButtons?: boolean;
  showMainFieldsOnly?: boolean;
  showSubmitButtonOnTop?: boolean;
  isLoginRegister?:string;
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
  props.config[1]?.("record", record);
  onCleanup(() => {
    props.config[1]?.("record", undefined);
  })

  // For new Form component, user will define layout, not a fixed layout;
  // We may use this component for render from the json.
  const groupByTabsAndGroup  = record.groupByTabsAndGroup();
  // TODO: Fix Tabs are not reactive
  const tabs = Object.keys(groupByTabsAndGroup).filter((tab) => tab !== "main");
  const [activeTab, setActiveTab] = createSignal(tabs[0]);

  const cleanUpConfig = {} as { [key: string]: any };

  onCleanup(() => {
    for (const rowMetaTxnId of cleanUpConfig.rowMetaTxnIds || [])
      revertTransaction(rowMetaTxnId);
  });
  let submit: boolean;
  const onSubmit = () => {
    // const valid = record.submitForm();
    const result = validationGroup.validate();
    if (result.isValid) {
      console.log("valid");
      // !!!TODO!!! Handle Error Received From server when commit
      if (!record.isRealTime) {
        commitTxn(record.txnId, Ws);
      }
      submit = true;
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
  // https://github.com/solidjs/solid-router
  useBeforeLeave((e: BeforeLeaveEventArgs) => {
    // if (form.isDirty && !e.defaultPrevented) {
    // preventDefault to block immediately and prompt user async
    e.preventDefault();
    if (submit || !txnHasSteps(record.txnId)) {
      e.retry(true);
      return;
    }
    setTimeout(() => {
      if (window.confirm("Discard unsaved changes - are you sure?")) {
        revertTransaction(record.txnId);
        // user wants to proceed anyway so retry with force=true
        e.retry(true);
      }
    }, 100);
  });

  const SubmitButton = () =>           <div class="flex gap:10">
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

  return (
      <RepeaterContext.Provider value={[record.vertex, ...useContext(RepeaterContext)]}><div
      ref={(el) => {
        setDivRef(el);
        validationGroup = new dxValidationGroup(divRef()!);
      }}
    >
      <Show when={props.showSubmitButtonOnTop ?? false}>
        <SubmitButton/>
      </Show>
     
      <Show when={divRef()}>
        <FormContext.Provider value={{ record, cleanUpConfig, validationGroup: validationGroup! }}>
          {/* Main Tab is displayed as top level fields */}
       <Show when={groupByTabsAndGroup["main"]}>
            <For each={Object.keys(groupByTabsAndGroup["main"])}>
              {(group) => (
                <>
                  <div
                    class="dx-fieldset"
                    style={{"max-width": "100%"}}
                  >
                    {/*<div class="dx-fieldset-header">Simple Field Set</div>*/}
                    
                       
                        <Show when={props.isLoginRegister ?? false}>
                          
                          <Show when={props.isLoginRegister==="Register"}>
                            <Register/>
                          </Show>
                          <Show when={props.isLoginRegister==="Login"}>
                          <Login/>
                          </Show>
                          
                          

                        </Show>
                       <Show when={!props.isLoginRegister }>
                       <div class="b:2  b:rgb(214,214,216) p:10 w:100% r:10|10|10|10 bg:#f5f5f5eb">
                       <div class=" p:10 w:full ">
                       <div class="w:full 	 justify-content:space-between	">
                          <div class="f:16 font:sans font:bold	">QUICK EDIT</div>
                          <Show when={props.importExportButtons ?? true}>
                            <div class="flex  gap:10 jc:end ">
                              <GenericField
                                meta={
                                  {
                                    P: {
                                      component: "Button",
                                      props: {
                                        stylingMode: "contained",
                                        width: "120",
                                        text: "Import",
                                        class:
                                          "bg:blue bg:rgb(24,98,234):hover text-fill:white",
                                      },
                                    },
                                  } as any
                                }
                                onClick={onImportClick}
                              />
                              <GenericField
                                meta={
                                  {
                                    P: {
                                      component: "Button",

                                      props: {
                                        stylingMode: "contained",
                                        width: "120",
                                        text: "Export",
                                        class: " text-fill:blue b:blue",
                                      },
                                    },
                                  } as any
                                }
                                onClick={onExportClick}
                              />
                            </div>
                          </Show>
                        </div>
                          <FormGroup
                            metaAttributes={groupByTabsAndGroup["main"][group]}
                            vertex={record.vertex}
                            setValue={record.setValue}
                            txnId={record.txnId}
                          />
                        </div>
                        </div>   
                       </Show>
                                    </div>
                </>
              )}
            </For>
          </Show>

        

          <Show when={tabs.length > 0 && !(props.showMainFieldsOnly ?? false)}>
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
                      metaAttributes={groupByTabsAndGroup[activeTab()][group]}
                      vertex={record.vertex}
                      setValue={record.setValue}
                      txnId={record.txnId}
                    />
                  </div>
                );
              }}
            </For>
          </Show>
          {/* @ts-ignore */}
          <div ref={(el) => new dxValidationSummary(el, { validationGroup: validationGroup! })} />

        <Show when={!(props.showSubmitButtonOnTop ?? false) && !props.isLoginRegister}>
          <SubmitButton/>
        </Show>
        </FormContext.Provider>
      </Show>
      <Show when={popup()}><PopOver/></Show>
      </div></RepeaterContext.Provider>
  );
};
