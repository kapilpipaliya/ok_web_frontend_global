import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  JSXElement,
  Match,
  on,
  onCleanup,
  onMount,
  Show,
  splitProps,
  Switch,
  untrack,
  useContext,
} from "solid-js";
import { createStore, SetStoreFunction, Store } from "solid-js/store";
import { FormContext, getEdgesFromRowsAttr, groupBy } from "~/lib/Utils";
import {
  getChildVertexes
} from "~/lib/graph/get/sync/traverse";
import { createForm, createMeta } from "~/lib/graph/mutate/form_functions";
import { RepeaterContext } from "~/components/dynamic/fields/static/GenaricField";
import { GenericField } from "~/components/dynamic/fields/static/GenericFieldComponent";
import {
  GraphContext,
  GraphInterface,
  Id,
  IdAttr,
  Vertex,
} from "~/lib/graph/graph";
import {
  commitTxn,
  getNewTxnId,
  revertTransaction,
  txnHasSteps,
} from "~/lib/graph/transaction";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import {
  BeforeLeaveEventArgs,
  useBeforeLeave,
  useLocation,
  useNavigate,
} from "@solidjs/router";
import { stringify } from "yaml";
import { TableTabs } from "~/components/custom/TableTabs";
import { FormMetaData } from "~/lib/Type";
// import { getPermissions } from "~/lib/graph/get/sync/auth";
import { submitDataCall } from "~/components/api/api_functions";
import { useToast } from "~/components/custom/Toast";
import {
  getExportCodeAsync,
  getFormMetaDataAsync,
} from "~/lib/graph/get/async/graph_functions";
import { DeleteDialog } from "~/components/custom/DeleteDialog";
import { getDataMGCall } from "~/cypher_api/lib/graph/get/async/traverse";
import { setGraphData } from "~/lib/websocket/ws_events";
import { PageConfigContext } from "~/lib/contexts";
import { FormGroup } from "./form/FormGroup";
import { findVertexesMGCall } from "~/cypher_api/functions/get/findVertex";

interface AbstractSingleFormProps
  extends Omit<DynamicFormProps, "form" | "id"> {
  formId: string;
  graph: Store<GraphInterface>;
  setGraph: SetStoreFunction<GraphInterface>;
  id: string | number;
  buttonAlign?: string;
  isDialogContext?: boolean;
}


export interface DynamicFormProps {
  meta?: Vertex;
  form: FormMetaData;
  id?: Id;
  isDialogContext?: boolean;
  buttonAlign?: string;
  submitButton?: JSXElement;
  importExportButtons?: boolean;
  showMainFieldsOnly?: boolean;
  showSubmitButtonOnTop?: boolean;
  isLoginRegister?: string;
  doMount?: boolean;
}
type FormData = {
  cleanUpConfig: () => {
    [key: string]: any;
  };
  txnId: number;
  formMeta: Vertex;
  formData: Vertex;
  tabs: string[];
  groupByTabsAndGroup: {
    [tab: string]: {
      [group: string]: Vertex[];
    };
  };
};

export function AbstractSingleForm(props: AbstractSingleFormProps) {
  const [formData, setFormData] = createStore(
    {} as {
      form: FormMetaData;
    },
  );

  const [p, customProps] = splitProps(props, ["formId", "id"]);
  const id = createMemo(() =>
    p.id === "new" ? undefined : p.id,
  );
  // TODO: add validation on form that AttrsTableData keys should not available.
  // Note: When the page is loaded server side, the client side will not run this again,
  // so set state inside it will not set when page is reloaded.
  const [data, { mutate, refetch }] = createResource(async () => {
    const form = await getFormMetaDataAsync(
      props.graph,
      props.setGraph,
      props.formId,
    );
    if (form.error) return "Error";

    return { formData: JSON.stringify(form) };
  });
  createEffect(() => {
    if (data() && data() !== "Error") {
      const result = JSON.parse(data().formData);
      if (result && !(result as { error: string }).error) {
        setFormData({ form: result.form as FormMetaData });
      }
    }

  });

  return (
    <Switch>
      <Match when={data.loading}>Loading</Match>

      <Match when={data.error}>Error</Match>

      {/* <Match when={data()?.error}>Error</Match> */}

      <Match when={formData.form}>
        <DynamicForm
          form={formData.form!}
          id={id() as Id}
          isDialogContext={props.isDialogContext}
          {...customProps}
          buttonAlign={props.buttonAlign}
        />
      </Match>
    </Switch>
  );
}

export function DynamicForm(props: DynamicFormProps) {
  const { Ws } = useContext(WsContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoadingToast, showWarningToast } = useToast();
  const [graph, setGraph] = useContext(GraphContext)!;
  const cleanUpConfig = {} as { [key: string]: any };
  const txnId = getNewTxnId(graph, setGraph);
  const [pageConfig, setPageConfig] = useContext(PageConfigContext) || [];

  const [formData, setFormData] = createStore({
    txnId,
    cleanUpConfig: () => cleanUpConfig,
  } as FormData);
  const [activeTab, setActiveTab] = createSignal("main");

  const fetchData = async () => {
    console.log(Object.keys(props), Object.values(props));

    try {
      if (!props.id) {
        // Load Form Meta from API
        return 'new';
      } else {
        // Load vertex from server
        const loadResult = await findVertexesMGCall({ id: props.id });
        if (loadResult.error) {
          return { error: loadResult.error };
        }

        const { incoming, outgoing }: { incoming: any; outgoing: any } =
          getEdgesFromRowsAttr(props.form.attributes);

        const result = await getDataMGCall({
          expression: `id:'${props.id}'`,
          incoming,
          outgoing,
        });

        if (result.error) {
          return { error: result.error };
        }

        return { graph: result.graph };
      }
    } catch (e: any) {
      return { error: `Error When Loading Form: ${e.message}` };
    }
  };

  const [data, { refetch }] = createResource(fetchData);

  createEffect(on(data, (data) => {
    if (data) {
      const result = data;
      let dataVertex;
      if (result === 'new') {
        const createResult = createForm(
          graph,
          setGraph,
          txnId,
          Ws,
          props.form[IdAttr],
        );

        dataVertex = createResult.vertex
      }

      if (result && !(result as { error?: string }).error) {
        if ((result as { graph?: GraphInterface }).graph) {
          setGraphData(
            graph,
            setGraph,
            (result as { graph: GraphInterface }).graph,
          );
        }
        // Load Form Meta and Data from API
        const metaVertexResult = untrack(() =>
          createMeta(props.form, graph, setGraph),
        );

        if (metaVertexResult.error) {
          console.error("Meta Vertex Error:", metaVertexResult.error);
          return;
        }
        const groupByTabsAndGroupFn = () => {
          const mainAttributes = getChildVertexes(
            graph,
            ["MetaAttr"],
            [metaVertexResult.vertex!],
          ); //.sort((a, b) => a.P.pos - b.P.pos);

          const groupByTabs = groupBy(
            mainAttributes.vertexes!,
            (item) => item.P.tab!,
          ) as unknown as {
            [tab: string]: Vertex[];
          };

          const groupByTabsAndGroup = {} as {
            [tab: string]: { [group: string]: Vertex[] };
          };

          for (const tab in groupByTabs) {
            groupByTabsAndGroup[tab] = groupBy(
              groupByTabs[tab]!,
              (item) => item.P.group!,
            ) as unknown as {
              [group: string]: Vertex[];
            };
          }
          return groupByTabsAndGroup;
        };
        const groupByTabsAndGroup = groupByTabsAndGroupFn();
        const tabs = Object.keys(groupByTabsAndGroup).filter(
          (tab) => tab !== "main",
        );

        setActiveTab(tabs[0]);
        setFormData({
          txnId,
          formMeta: metaVertexResult.vertex!,
          formData: graph.vertexes[props.id!] ?? dataVertex!,
          tabs,
          groupByTabsAndGroup,
        });

        setPageConfig?.("formData", formData);
      }
    }
  }));

  // focus first input
  const [divRef, setDivRef] = createSignal<HTMLDivElement>();
  onMount(() => {
    // @ts-ignore
    if (props.doMount === null || props.doMount !== false)
      divRef()?.querySelector?.("input")?.focus();
  });

  // let validationGroup: dxValidationGroup;
  onCleanup(() => {
    // @ts-ignore
    setPageConfig?.("formData", undefined);
  });

  onCleanup(() => {
    for (const rowMetaTxnId of cleanUpConfig.rowMetaTxnIds || [])
      revertTransaction(rowMetaTxnId);
  });

  let submit: boolean;
  const onSubmit = async () => {
    // we cant have validationGroup when doing code. can we register components on the fly to enable validations?
    // const result = validationGroup.validate();
    const isValid = true;
    const isRealTime = false;
    let data;
    if (isValid) {
      // !!!TODO!!! Handle Error Received From server when commit
      if (!isRealTime) {
        data = commitTxn(txnId, Ws);
        if (!data) {
          setTimeout(() => navigate(-1), 0);
          showWarningToast("Internal Server Error");
          return;
        }

        await showLoadingToast({
          promise: submitDataCall(data, txnId),
          loadMessage: "Submitting Data...",
          successMessage: "Data submitted successfully",
          onSuccess: (value) => {
            // currently we are navigating back.
            setTimeout(() => navigate(-1), 500);
          },
          onError: (error) => { },
        });
      }
      submit = true;
    } else {
      showWarningToast("please fix all errors");
    }
    if (!data) {
      setTimeout(() => navigate(-1), 0);
      return;
    }

    return isValid;
  };

  const onCancel = () => {
    revertTransaction(txnId);
    if (props.isDialogContext) {
    } else {
      setTimeout(() => {
        navigate(-1);
      }, 0);
    }
  };

  const [popup, setPopup] = createSignal(false);
  const [discradPopup, setDiscradPopup] = createSignal(false);

  // https://github.com/solidjs/solid-router
  useBeforeLeave((e: BeforeLeaveEventArgs) => {
    if (submit || !txnHasSteps(formData.txnId)) {
      return;
    }
    // if (form.isDirty && !e.defaultPrevented) {
    // preventDefault to block immediately and prompt user async
    e.preventDefault();
    setTimeout(() => {
      setDiscradPopup(true);
    }, 100);
  });

  const SubmitButton = () => (
    <div
      style={{
        "justify-content": props.buttonAlign || "start",
        display: "flex",
      }}
    >
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
    </div>
  );

  return (
    <Switch>
      <Match when={data.loading}>Loading</Match>

      <Match when={data.error}>Error</Match>

      <Match when={formData.formData}>
        <RepeaterContext.Provider
          value={[formData.formData, ...useContext(RepeaterContext)]}
        >
          <div
            ref={(el) => {
              setDivRef(el);
              // validationGroup = new dxValidationGroup(divRef()!);
            }}
          >
            <Show when={props.showSubmitButtonOnTop ?? false}>
              <SubmitButton />
            </Show>

            <Show when={divRef()}>
              <FormContext.Provider value={formData}>
                <Show when={formData.groupByTabsAndGroup !== undefined}>
                  {/* Main Tab is displayed as top level fields */}
                  <For each={Object.keys(formData.groupByTabsAndGroup["main"])}>
                    {(group) => (
                      <>
                        <div
                          class="dx-fieldset"
                          style={{ "max-width": "100%" }}
                        >
                          <Show when={props.importExportButtons ?? true}>
                            {ImportExportButtons()}
                          </Show>

                          <div class="b:1 b:rgb(214,214,216) w:100% r:10|10|10|10 bg:rgb(237,237,237,.75)">
                            <div class="p:5|15|15|15 w:full">
                              <FormGroup
                                graph={graph}
                                setGraph={setGraph}
                                metaAttributes={
                                  formData.groupByTabsAndGroup["main"][group]
                                }
                                labelPrefix={"Form"}
                                vertex={formData.formData}
                                txnId={formData.txnId}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </For>
                </Show>
                <Show
                  when={
                    formData.tabs?.length > 0 &&
                    !(props.showMainFieldsOnly ?? false)
                  }
                >
                  <TableTabs tabs={formData.tabs} setActiveTab={setActiveTab} />
                  <br />
                  <For
                    each={Object.keys(
                      formData.groupByTabsAndGroup[activeTab()],
                    )}
                  >
                    {(group) => {
                      return (
                        <div
                          class="dx-fieldset"
                          style={{
                            "max-width": getTabsWidth(
                              formData.groupByTabsAndGroup[activeTab()][group],
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
                              formData.groupByTabsAndGroup[activeTab()][group]
                            }
                            labelPrefix={""}
                            vertex={formData.formData}
                            txnId={formData.txnId}
                          />
                        </div>
                      );
                    }}
                  </For>
                </Show>
                {/* @ts-ignore */}
                <br />
                <div />

                <Show
                  when={
                    !(props.showSubmitButtonOnTop ?? false) &&
                    !props.isLoginRegister
                  }
                >
                  <SubmitButton />
                </Show>
              </FormContext.Provider>
            </Show>
            <Show when={popup()}>PopOver</Show>
            <Show when={discradPopup()}>
              <DeleteDialog
                open={discradPopup()}
                onConfirm={() => {
                  revertTransaction(formData.txnId);
                  setDiscradPopup(false);
                }}
                title="Discard changes"
                message="Discard unsaved changes - are you sure?"
              />
            </Show>
          </div>
        </RepeaterContext.Provider>
      </Match>
    </Switch>
  );

  function ImportExportButtons() {
    return <div
      style={{
        "justify-content": "end",
        "margin-bottom": "10px",
        display: "flex",
      }}
    >
      <GenericField
        meta={{
          P: {
            component: "Button",
            props: {
              children: "Import",
              variant: "outlined",
              onClick: () => {
                setPopup(true);
              },
            },
          },
        } as any} />
      <GenericField
        meta={{
          P: {
            component: "Button",
            props: {
              children: "Export",
              onClick: () => {
                setPopup(true);
              },
              class: " b:blue",
            },
          },
        } as any} />
    </div>;
  }
}



function getTabsWidth(group: Vertex[]) {
  return group.filter((attribute) => attribute.P.component === "Table").length
    ? "100%"
    : "600px";
}
