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
import { SetStoreFunction, Store } from "solid-js/store";
import { toTitle } from "case-switcher-js";
import {
  commitTxn, getNewGraphId,
  getNewTxnId,
  graph,
  Id,
  IdAttr,
  revertTransaction, revertTransactionUpTo, transactions, txnHasSteps,
  Vertex
} from "../lib/graph";
import { addNewVertex, mergeVertexProperties, newVertex } from "../lib/Vertex";
import { WsContext } from "../utils/ws_events_dispatcher";

import {
  SelectInputField,
} from "./input/SelectInputField";
import {
  TableInputField,
} from "./input/TableInputField";

import Tabs from "devextreme/ui/tabs";
import {
  BeforeLeaveEventArgs,
  useBeforeLeave,
  useNavigate
} from "@solidjs/router";
import {
  genericComponents,
  GenericInputField,
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
  GenericField
} from "./input/GenaricField";
import {
  addMetaVertexes,
  addNewRow, FieldAttribute,
  FormContext,
  FormMetaData, getCollAttrComp,
  getExportCode,
  getFormMetaData,
  newRow,
  Record
} from "../lib/Record";
import dxPopup, { Properties as dxPopupProperties } from "devextreme/ui/popup";
import { stringify } from "yaml";
import { Modal, ModalBody, ModalHeader, ModalContent, ModalFooter, Button } from "solid-blocks";
import { Portal } from "solid-js/web";

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

interface FormGroupProps {
  metaAttributes: Vertex[];
  vertex: Vertex;
  setValue(attribute: Vertex, vertex: Vertex, data: any): void;
}

export function getComponentForCollRow(metaVertex: Vertex, data: Vertex) {
    if (!metaVertex.P.component) {
      return getCollAttrComp(metaVertex)?.P[IdAttr];
    } else if (metaVertex.P.component.includes("-")) {
      return getOptionLabel(data, metaVertex.P.component);
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
interface FormGroupPropertiesProps {
  metaAttributes: Vertex[];
  vertex: Vertex;
  setValue(attribute: Vertex, vertex: Vertex, data: any, valueSet?: boolean): Vertex | undefined;
  setValueGeneric(attribute: Vertex, vertex: Vertex, data: any): void;
  txnId: number;
}
// group of the fields
export function FormGroupProperties(props: FormGroupPropertiesProps) {
  const { Ws } = useContext(WsContext);
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
        />
        const Modal3 = () => {
          const [isModalOpen, setModalOpen] = createSignal(false);
          const toggle = () => setModalOpen(prev => !prev);
          let prevTxnIndex = 0;
          const onCancel = () => {
            prevTxnIndex && revertTransactionUpTo(props.txnId, prevTxnIndex);
            toggle();
          }

          const Body = (bodyProps: {meta: Vertex}) => {
            prevTxnIndex = transactions.get(props.txnId)?.steps?.length || 0

            const propVertex = props.setValue(bodyProps.meta, props.vertex, 0, false)
            if (!propVertex) {
              console.warn('can not create row');
              return;
            }


const meta = [
      {
        name: "condition",
        displayName: "Conditions",
        component: "Table",
        attributes: [
          {
            name: "leftParen",
            displayName: "Paren",
            component: "SelectBox",
            props: {
              items: `(
((
(((`,
            },
          },{
            name: "field",
            displayName: "Paren",
            component: "SelectBox",
            props: {
              // collection: "DataType",
            },
          },{
            name: "operator",
            displayName: "Paren",
            component: "SelectBox",
            props: {
              items: `<
<=
>=`,
            },
          },
          {
            name: "rightParen",
            displayName: "Paren",
            component: "SelectBox",
            props: {
              items: `)
))
)))`,
            },
          }

        ]
      },
      {
        name: "dataType",
        displayName: "DataType",
        component: "SelectBox",
        props: {
          collection: "DataType",
        },
      },
      {
        name: "comp",
        displayName: "Component",
        component: "SelectBox",
        props: {
          collection: "Comp",
        },
      },
      {
        name: "value",
        displayName: "Value",
        meta: "->$0Comp-CompChild->$0Prop+->$0Comp->$0Prop+->$0ValueProp",
        component:
         `->$0Comp-CompChild:P.name||->$0Comp:P.name||->$0DataType->$0Default:P.name||=${component()}`,
      }
    ] as FieldAttribute[];

            const metaVertexId = getNewGraphId();
            const txnId = getNewTxnId();
            addNewVertex(txnId, newVertex(metaVertexId, ["MetaAttr"], {name: "Rule"}));
            addMetaVertexes(txnId, graph.vertexes[metaVertexId], meta);
            onCleanup(() => {
              revertTransaction(txnId);
            })

            return <TableInputField meta={graph.vertexes[metaVertexId]}
                                    data={propVertex}
                                    txnId={props.txnId}
                                    setValue={props.setValueGeneric}
                                    isRealTime={false}  />
          }

          return <><GenericField
           meta={{
             P: {
               component: "Button",
               props: { icon: "formula" }
             }
           } as any}
           onClick={toggle}
          />
            <Show when={isModalOpen()}>
              <Portal>
                <div role="dialog" tabIndex={-1} class="sb-modal">
                  <ModalContent>
                    <ModalHeader>
                      Header
                      <Button
                       variant="icon"
                       onclick={toggle}
                       style={{ float: "right" }}
                      >
                        ✕
                      </Button>
                    </ModalHeader>
                    <ModalBody>
                      <Body meta={metaVertex}/>
                    </ModalBody>
                    <ModalFooter>
                      {/*<Button onclick={toggle}>OK</Button>*/}
                      <div class="flex gap:4">
                        <GenericField
                         meta={{
                           P: {
                             component: "Button",
                             props: {
                               stylingMode: "contained",
                               type: "success",
                               text: "Submit"
                             }
                           }
                         } as any}
                         onClick={toggle}
                        />

                        <GenericField
                         meta={{
                           P: {
                             component: "Button",
                             props: {
                               stylingMode: "contained",
                               type: "danger",
                               text: "Cancel"
                             }
                           }
                         } as any}
                         onClick={onCancel}
                        />
                      </div>

                    </ModalFooter>
                  </ModalContent>
                </div>
              </Portal>
            </Show>

          </>;
        }
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
                <div class="dx-field-value flex gap:2 justify-content:space-between">
                  <Content/>

                  <Modal3/>



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
    <div
      ref={(el) => {
        setDivRef(el);
        validationGroup = new dxValidationGroup(divRef()!);
      }}
    >
      <Show when={props.showSubmitButtonOnTop ?? false}>
        <SubmitButton/>
      </Show>
      <Show when={props.importExportButtons ?? true}>
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
                    style={{"max-width": getTabsWidth(groupByTabsAndGroup["main"][group])}}
                  >
                    {/*<div class="dx-fieldset-header">Simple Field Set</div>*/}
                    <FormGroup metaAttributes={groupByTabsAndGroup["main"][group]} vertex={record.vertex} setValue={record.setValue} />
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
                    />
                  </div>
                );
              }}
            </For>
          </Show>
          {/* @ts-ignore */}
          <div ref={(el) => new dxValidationSummary(el, { validationGroup: validationGroup! })} />

        <Show when={!(props.showSubmitButtonOnTop ?? false)}>
          <SubmitButton/>
        </Show>
        </FormContext.Provider>
      </Show>
      <Show when={popup()}><PopOver/></Show>
    </div>
  );
};
