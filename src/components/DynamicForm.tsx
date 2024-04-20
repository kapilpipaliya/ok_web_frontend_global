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
import {
    commitTxn,
    GraphContext,
    GraphInterface,
    Id,
    IdAttr,
    revertTransaction,
    txnHasSteps,
    Vertex
} from "../lib/graph";
import {WsContext} from "../utils/ws_events_dispatcher";
import {BeforeLeaveEventArgs, useBeforeLeave, useLocation, useNavigate} from "@solidjs/router";
import {
    getSelectionOptions,
    Record,
    FormContext, getChildVertexes, groupBy,
} from "../lib/Utils";
import {RepeaterContext} from "./input/GenaricField";
import {GenericField} from "./input/Components/GenericFieldComponent";
import {getCollAttrComp, getExportCode, getFormMetaData} from "../lib/Record";
import {stringify} from "yaml";
import {getPermissions} from "../lib/auth";
import {TableTabs} from "./TableTabs";
import {DynamicComponent} from "./DynamicComponent";
import {FormMetaData} from "../lib/Type";

interface AbstractSingleFormProps extends Omit<DynamicFormProps, "form" | "id"> {
    formId: string;
    graph: Store<GraphInterface>;
    setGraph: SetStoreFunction<GraphInterface>;
    id: string | number;
}

export const AbstractSingleForm = (props: AbstractSingleFormProps) => {
    // TODO: add validation on form that AttrsTableData keys should not available.

    const form = getFormMetaData(props.graph,props.setGraph,props.formId);
    if (form.error) return form.error;

    const [p, customProps] = splitProps(props, ["formId", "id"]);

    const id = createMemo(() => (p.id === "new" ? undefined : parseInt(p.id as string)));
    return (
            <DynamicForm form={form.form!} id={id() as Id} {...customProps}
                         config={props.config || []}/>
    );
};

interface FormGroupProps {
    metaAttributes: Vertex[];
    vertex: Vertex;
    labelPrefix: String;
    graph: Store<GraphInterface>;
    setGraph: SetStoreFunction<GraphInterface>;
    txnId: number;
    isLoginRegister?: string
}

export function getComponentForCollRow(metaVertex: Vertex, data: Vertex,graph: Store<GraphInterface>,setGraph: SetStoreFunction<GraphInterface>){
    if (!metaVertex.P.component) {
        return getCollAttrComp(metaVertex,graph)?.P[IdAttr];
    } else if (metaVertex.P.component.includes("-")) {
        return getSelectionOptions(graph,setGraph,[data], metaVertex.P.component).vertexes;
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
                const component = createMemo(() => getComponentForCollRow(metaVertex, props.vertex,props.graph,props.setGraph));
                const Label = () => <>{toTitle(metaVertex.P.displayName || metaVertex.P[IdAttr] || metaVertex.P.key || '')}</>
                const Content = () => (
                    <DynamicComponent
                        component={component()}
                        meta={metaVertex}
                        title={toTitle(
                            metaVertex.P.displayName ||
                            metaVertex.P[IdAttr] ||
                            metaVertex.P.key ||
                            ""
                        )}
                        data={props.vertex}
                        // setValue={props.setValue}
                        // disabled={props.d}
                        txnId={props.txnId}
                        isRealTime={false}
                    />
                );
                const permissions = metaVertex.P.metaId ? getPermissions(props.graph.vertexes[metaVertex.P.metaId]) : getPermissions(metaVertex);

                return (
                    <Switch>
                        <Match when={component() === "Table"}>
                            {/* <h3><Label/></h3> */}
                            <Content/>
                        </Match>

                        <Match when={component() === "CollectionOption"}>
                            <Content/>
                        </Match>

                        <Match when={true}>
                            <div class="grid-cols:2 " style={{'padding-top': "5px"}}>
                                <div id={id}>
                                    {props.labelPrefix as string} <Label/>
                                </div>
                            </div>
                            <div>
                                <Content/>
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
    isLoginRegister?: string;
    doMount?: boolean
}

function getTabsWidth(group: Vertex[]) {
    return group.filter(
        (attribute) => attribute.P.component === "Table"
    ).length
        ? "100%"
        : "600px"
}

export const DynamicForm = (props: DynamicFormProps) => {
    const {Ws} = useContext(WsContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [graph, setGraph] = useContext(GraphContext)!;

    const record = new Record({ws: Ws});
    if (!props.id) {
        const createResult = record.create(graph,setGraph,props.form[IdAttr]);
        if (createResult.error) return createResult.error;
    } else {
        const loadResult = record.load(graph,props.id);
        if (loadResult.error) return loadResult.error;
    }
    record.createMeta(props.form,graph,setGraph);

    // focus first input
    const [divRef, setDivRef] = createSignal<HTMLDivElement>();
    onMount(() => {
        // @ts-ignore
        if (props.doMount === null || props.doMount !== false)
            divRef()?.querySelector?.("input")?.focus();

    });

    // let validationGroup: dxValidationGroup;
    props.config[1]?.("record", record);
    onCleanup(() => {
        props.config[1]?.("record", undefined);
    });

    const groupByTabsAndGroupFn = () => {
        const mainAttributes = getChildVertexes(graph,["MetaAttr"], [record.metaVertex]); //.sort((a, b) => a.P.pos - b.P.pos);

        const groupByTabs = groupBy(mainAttributes.vertexes!, (item) => item.P.tab!) as unknown as {
            [tab: string]: Vertex[];
        };

        const groupByTabsAndGroup = {} as {
            [tab: string]: { [group: string]: Vertex[]; };
        };
        for (const tab in groupByTabs) {
            groupByTabsAndGroup[tab] = groupBy(groupByTabs[tab]!, (item) => item.P.group!) as unknown as {
                [group: string]: Vertex[];
            };
        }
        return groupByTabsAndGroup;
    };

    // For new Form component, user will define layout, not a fixed layout;
    // We may use this component for render from the json.
    const groupByTabsAndGroup = groupByTabsAndGroupFn();
    // TODO: Fix Tabs are not reactive
    const tabs = Object.keys(groupByTabsAndGroup).filter((tab) => tab !== "main");

    const cleanUpConfig = {} as { [key: string]: any };

    onCleanup(() => {
        for (const rowMetaTxnId of cleanUpConfig.rowMetaTxnIds || [])
            revertTransaction(rowMetaTxnId);
    });
    let submit: boolean;
    const onSubmit = () => {
        // const valid = record.submitForm();
        // const result = validationGroup.validate();
        const isValid = true; // result.isValid;
        if (isValid) {
            // !!!TODO!!! Handle Error Received From server when commit
            if (!record.isRealTime) {
                commitTxn(record.txnId, Ws);
            }
            submit = true;
            // currently we are navigating back.
            setTimeout(() => navigate(-1),0);
        } else {
            alert("please fix all errors");
        }
    }

    const onCancel = () => {
        revertTransaction(record.txnId);
        setTimeout(() => {
            navigate(-1);
        },0);
    }

    const [popup, setPopup] = createSignal(false);
    const [importCode, setImportCode] = createSignal("");
    const importCodeFn = () => {
        // importNavigation(importCode(), record);
    };
    let popupConfig: any;

    const ImportComponent = () => {
        return <textarea class="h:95% w:100%" value={importCode()}
                         onchange={e => setImportCode(e.target.value)}/>
    }
    const PreviewCode = () => {
        return <pre>{stringify(getExportCode(graph,record))}</pre>;
    };
    const onImportClick = (data: any) => {
        popupConfig = (instance: () => dxPopup) => ({
            contentTemplate: ImportComponent,
            width: 500,
            height: 500,
            title: "Import",
            "position.of": data.element,
            toolbarItems: [
                {
                    widget: "dxButton",
                    toolbar: "bottom",
                    location: "before",
                    options: {
                        icon: "import",
                        text: "Import",
                        onClick: () => importCodeFn(),
                    },
                },
                {
                    widget: "dxButton",
                    toolbar: "bottom",
                    location: "after",
                    options: {
                        text: "Close",
                        onClick() {
                            instance().hide();
                            setPopup(false);
                        },
                    },
                },
            ],
        });
        setPopup(true);
    }

    const onExportClick = (data: any) => {
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
            /*            let instance: dxPopup;
                        onMount(() => {
                            instance = new dxPopup(el, {
                                container: '.dx-viewport',
                                showTitle: true,
                                visible: false,
                                dragEnabled: false,
                                hideOnOutsideClick: true,
                                showCloseButton: false,
                                onHidden: () => setPopup(false),
                                position: {
                                    at: 'bottom',
                                    my: 'center',
                                    collision: 'fit',
                                },
                                ...popupConfig(() => instance)
                            } as dxPopupProperties);
                            instance.show();
                        })
                        onCleanup(() => instance.dispose());*/
        }}/>
    }
    // https://github.com/solidjs/solid-router
    useBeforeLeave((e: BeforeLeaveEventArgs) => {
        if (submit || !txnHasSteps(record.txnId)) {
            return;
        }
        // if (form.isDirty && !e.defaultPrevented) {
        // preventDefault to block immediately and prompt user async
        e.preventDefault();
        setTimeout(() => {
            if (window.confirm("Discard unsaved changes - are you sure?")) {
                revertTransaction(record.txnId);
                // user wants to proceed anyway so retry with force=true
                e.retry(true);
            }
        }, 100);
    });

    const SubmitButton = () => (
        <div style={{"justify-content": "center", display: "flex"}}>
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
                                        type: "primary",
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
                                variant: "outlined",
                                class: "border-color:#FF0000 color:#FF0000 danger",
                                children: "Cancel",
                                onClick: () => onCancel(),
                            },
                        },
                    } as any
                }
            />
        </div>
    );
    const [activeTab, setActiveTab] = createSignal(tabs[0]);


    return (
        <RepeaterContext.Provider
            value={[record.vertex, ...useContext(RepeaterContext)]}
        >
            <div
                ref={(el) => {
                    setDivRef(el);
                    // validationGroup = new dxValidationGroup(divRef()!);
                }}
            >
                <Show when={props.showSubmitButtonOnTop ?? false}>
                    <SubmitButton/>
                </Show>

                <Show when={divRef()}>
                    <FormContext.Provider
                        value={{
                            record,
                            cleanUpConfig,
                            // validationGroup: validationGroup!,
                        }}
                    >
                        {/* Main Tab is displayed as top level fields */}
                        <Show when={groupByTabsAndGroup["main"]}>
                            <For each={Object.keys(groupByTabsAndGroup["main"])}>
                                {(group) => (
                                    <>
                                        <div class="dx-fieldset" style={{"max-width": "100%"}}>
                                            {/*<div class="dx-fieldset-header">Simple Field Set</div>*/}

                                            <div class="b:2  b:rgb(214,214,216) p:10 w:100% r:10|10|10|10 bg:#f5f5f5eb">
                                                <div class=" p:10 w:full ">
                                                    <div class="w:full 	 justify-content:space-between	">
                                                        <Show when={props.importExportButtons ?? true}>
                                                            <div
                                                                style={{
                                                                    "justify-content": "center",
                                                                    display: "flex",
                                                                }}
                                                            >
                                                                <GenericField
                                                                    meta={
                                                                        {
                                                                            P: {
                                                                                component: "Button",
                                                                                props: {
                                                                                    children: "Import",
                                                                                    onClick: () => onImportClick,
                                                                                },
                                                                            },
                                                                        } as any
                                                                    }
                                                                />
                                                                <GenericField
                                                                    meta={
                                                                        {
                                                                            P: {
                                                                                component: "Button",
                                                                                props: {
                                                                                    children: "Export",
                                                                                    onClick: () => onExportClick,
                                                                                    class: " b:blue",
                                                                                },
                                                                            },
                                                                        } as any
                                                                    }
                                                                />
                                                            </div>
                                                        </Show>
                                                    </div>

                                                    <FormGroup
                                                        graph={graph}
                                                        setGraph={setGraph}
                                                        metaAttributes={
                                                            groupByTabsAndGroup["main"][group]
                                                        }
                                                        labelPrefix={'Form'}
                                                        vertex={record.vertex}
                                                        txnId={record.txnId}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </For>
                        </Show>

                        <Show
                            when={tabs.length > 0 && !(props.showMainFieldsOnly ?? false)}
                        >
                            {/* old code for tabs */}
                            {/* <div
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
              
            /> */}
                            <TableTabs tabs={tabs} setActiveTab={setActiveTab}/>
                            <br/>
                            <For each={Object.keys(groupByTabsAndGroup[activeTab()])}>
                                {(group) => {
                                    return (
                                        <div
                                            class="dx-fieldset"
                                            style={{
                                                "max-width": getTabsWidth(
                                                    groupByTabsAndGroup[activeTab()][group]
                                                ),
                                            }}
                                        >
                                            <Show when={group !== "main"}>
                                                <div class="dx-fieldset-header">{group}</div>
                                            </Show>
                                            <FormGroup
                                                graph={graph}
                                                setGraph={setGraph}
                                                metaAttributes={
                                                    groupByTabsAndGroup[activeTab()][group]
                                                }
                                                labelPrefix={''}
                                                vertex={record.vertex}
                                                txnId={record.txnId}
                                            />
                                        </div>
                                    );
                                }}
                            </For>
                        </Show>
                        {/* @ts-ignore */}
                        <br/>
                        <div
                            // ref={(el) =>
                            // new dxValidationSummary(el, {
                            //   validationGroup: validationGroup!,
                            // })
                            // }
                        />

                        <Show
                            when={
                                !(props.showSubmitButtonOnTop ?? false) &&
                                !props.isLoginRegister
                            }
                        >
                            <SubmitButton/>
                        </Show>
                    </FormContext.Provider>
                </Show>
                <Show when={popup()}>
                    <PopOver/>
                </Show>
            </div>
        </RepeaterContext.Provider>
    );
};
