import {
  createMemo,
  createSignal,
  For,
  type JSXElement,
  Match,
  onCleanup,
  onMount,
  Show,
  splitProps,
  Switch,
  untrack,
  useContext,
} from "solid-js";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import { groupBy, isPageDesignerPath } from "~/lib/utils";
import { getChildVertexes } from "~/lib/graph/get/sync/traverse";
import { createMeta } from "~/lib/graph/mutate/form/metaFunction";
import { createForm } from "~/lib/graph/mutate/form/createForm";
import { GenericField } from "~/components/fields/GenericField";
import {
  GraphContext,
  type GraphInterface,
  type Id,
  IdAttr,
  type Vertex,
} from "~/lib/graph/graph";
import {
  ProcessStatus,
  commitTxn,
  getNewTxnId,
  revertTransaction,
  txnHasSteps,
} from "~/lib/graph/transaction";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import {
  type BeforeLeaveEventArgs,
  useBeforeLeave,
  useLocation,
  useNavigate,
} from "@solidjs/router";
import { TableTabs } from "~/components/TableTabs";

import { submitDataCall } from "~/lib/api/api_functions";
import { useToast } from "~/components/Toast";
import { DeleteDialog } from "~/components/DeleteDialog";
import { setGraphData } from "~/lib/websocket/setGraphData";
import { FormContext, FormSettingsContext, PageConfigContext } from "~/lib/contexts";
import { FormGroup } from "./FormGroup";
import { LoaderNew } from "~/components/LoaderSimple";
import { Icon } from "@iconify-icon/solid";
import { componentDrop } from "~/lib/drag_drop/drop/componentDrop";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/findVertex";
import {
  RepeaterVertexContext
} from "~/components/page_attr_render/Context";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";
import { checkIfNameExistsMGCall } from "~/cypher/get/checkIfNameExists";
import { getDataMGCall } from "~/cypher/get/getDataMGCall";
import { FormMetaData } from "~/lib/formMetaData";
import { AdminAttrKeys } from "~/lib/constants";
import { FormMetaDataAuth } from "~/lib/formMetaDataAuth";

export interface DynamicFormProps {
  meta?: Vertex;
  id?: Id;
  isDialogContext?: boolean;
  buttonAlign?: string;
  submitButton?: JSXElement;
  importExportButtons?: boolean;
  showMainFieldsOnly?: boolean;
  showSubmitButtonOnTop?: boolean;
  isLoginRegister?: string;
  doMount?: boolean;
  formId: string;
  graph: Store<GraphInterface>;
  setGraph: SetStoreFunction<GraphInterface>;
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

export function DynamicForm(props: Readonly<DynamicFormProps>) {
  const [p, customProps] = splitProps(props, ["formId", "id"]);
  const id = createMemo(() => (p.id === "new" ? undefined : p.id));

  // TODO: add validation on form that AttrsTableData keys should not available.

  const { Ws } = useContext(WsContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoadingToast, showWarningToast, showErrorToast } = useToast();
  const [graph, setGraph] = useContext(GraphContext)!;
  const cleanUpConfig = {} as { [key: string]: any };
  const txnId = getNewTxnId(graph, setGraph);
  const [pageConfig, setPageConfig] = useContext(PageConfigContext) || [];
  const [formSettings, setFormSettings] = useContext(FormSettingsContext) || [];

  const [formData, setFormData] = createStore({
    txnId,
    cleanUpConfig: () => cleanUpConfig,
  } as FormData);
  const [activeTab, setActiveTab] = createSignal("main");
  const form =
    FormMetaData[props.formId] ||
    (AdminAttrKeys.includes(props.formId) && FormMetaDataAuth[props.formId]);

  const [error, setError] = createSignal<string | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [divRef, setDivRef] = createSignal<HTMLDivElement>();
  const [popup, setPopup] = createSignal(false);
  const [discradPopup, setDiscradPopup] = createSignal(false);
  let submit: boolean;
  let onConfirmExit: () => void;

  const fetchData = async (id: Id) => {
    try {
      const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);
      const result = await getDataMGCall({
        expression: `id:'${id}'`,
        incoming,
        outgoing,
      });

      // @ts-ignore
      if (result.error || !result.graph) {
        // @ts-ignore
        return { error: result.error || "Error When Loading Form" };
      }

      return { graph: result.graph };
    } catch (e: any) {
      console.error("error", e);
      return { error: `Error When Loading Form: ${e.message}` };
    }
  };

  const onFormDataGet = () => {
    let dataVertex: Vertex;
    if (!id()) {
      const createResult = createForm(
        graph,
        setGraph,
        txnId,
        Ws,
        form[IdAttr],
      );

      dataVertex = createResult.vertex!;

      // if new form then add a form component in the layout
      if (dataVertex?.L[0] === "Form") {
        // add form component
        const formCompVertex = findVertexByLabelAndUniqueId(
          graph,
          "Comp",
          IdAttr,
          "Form",
        );
        const layoutRowId = componentDrop(
          dataVertex,
          txnId,
          formCompVertex!,
          dataVertex!,
          graph,
          setGraph,
        );
        setFormSettings('activeStepId', layoutRowId);

        if (layoutRowId === -1) return;
      }
    }
    // Load Form Meta and Data from API
    const metaVertexResult = untrack(() =>
      createMeta(form, graph, setGraph),
    );

    if (metaVertexResult.error) {
      setError("Meta Vertex Error");
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
          groupByTabs[tab],
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
      formData: graph.vertexes[id() as Id] ?? dataVertex!,
      tabs,
      groupByTabsAndGroup,
    });

    setPageConfig?.("formData", formData);
  }

  const onSubmit = async () => {
    const isValid = true;
    const isRealTime = false;
    let data;
    if (isValid) {
      // !!!TODO!!! Handle Error Received From server when commit
      if (!isRealTime) {
        data = commitTxn(txnId, Ws, graph);
        if (!data) {
          setTimeout(() => navigate(-1), 0);
          showWarningToast("Internal Server Error");
          return;
        }

        const name = formData?.formData?.P.name;

        const res = await checkIfNameExistsMGCall(
          form[IdAttr],
          name,
          id() as Id,
        );

        if (res.error === true) {
          showErrorToast(res.message);
          return;
        }

        const label = formData.formData.L[0].replace(/([A-Z])/g, ' $1').trim();
        await showLoadingToast({
          promise: submitDataCall({ ...data, name }, graph, setGraph, txnId),
          loadMessage: `Saving ${label}...`,
          successMessage: `${label} Saved Successfully`,
          onSuccess: (value) => {
            graph.transactions.get(txnId)!.status = ProcessStatus.AckReceived;
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
    revertTransaction(txnId, graph);
    if (!props.isDialogContext) {
      setTimeout(() => {
        navigate(-1);
      }, 0);
    }
  };

  const ImportExportButtons = () => (
    <div
      style={{
        "justify-content": "end",
        "margin-bottom": "10px",
        display: "flex",
      }}
    >
      <GenericField
        meta={
          {
            P: {
              component: "Button",
              children: "Import",
              variant: "outlined",
              style: { display: "flex" },
              leading: () => (
                <Icon
                  icon={"lets-icons:import"}
                  height={22}
                  width={22}
                />
              ),
              onClick: () => {
                setPopup(true);
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
              children: "Export",
              onClick: () => {
                setPopup(true);
              },
              style: { display: "flex" },
              leading: () => (
                <Icon
                  icon={"lets-icons:export"}
                  height={22}
                  width={22}
                />
              ),
              class: " b:blue",
            },
          } as any
        }
      />
    </div>
  );

  const SubmitButton = () => (
    <div
      style={{
        "justify-content": props.buttonAlign || "start",
        display: "flex",
      }}
    >
      <button style={{ "margin-right": "7px" }} class="border-color:#FF0000 color:#FF0000 danger" onClick={onCancel}>Cancel</button>
      <Show
        when={props.submitButton}
        fallback={
          <button onClick={onSubmit}>Save</button>
        }
      >
        {props.submitButton}
      </Show>
    </div>
  );

  onMount(async () => {
    setIsLoading(true);
    if (id()) {
      const data = await fetchData(id()!);
      if (data.error) {
        setError(data.error);
      } else if ((data as { graph?: GraphInterface }).graph) {
        setGraphData(
          graph,
          setGraph,
          (data as { graph: GraphInterface }).graph,
        );
      }
    }
    setIsLoading(false);
    onFormDataGet();
    setIsLoading(false);
  });

  onMount(() => {
    if (props.doMount === null || props.doMount !== false)
      divRef()?.querySelector?.("input")?.focus();
  });

  onCleanup(() => {
    setPageConfig?.("formData", undefined);
  });

  onCleanup(() => {
    for (const rowMetaTxnId of cleanUpConfig.rowMetaTxnIds || [])
      revertTransaction(rowMetaTxnId, graph);
  });

  useBeforeLeave((e: BeforeLeaveEventArgs) => {
    if (submit || !txnHasSteps(formData.txnId, graph)) {
      return;
    }
    e.preventDefault();
    setTimeout(() => {
      setDiscradPopup(true);
    }, 100);
    onConfirmExit = () => {
      e.retry(true);
    };
  });

  return (
    <Switch>
      <Match when={isLoading()}>
        <LoaderNew />
      </Match>

      <Match when={error()}>{error()}</Match>

      <Match when={formData.formData}>
        <RepeaterVertexContext.Provider
          value={[formData.formData, ...useContext(RepeaterVertexContext)]}
        >
          <div
            ref={(el) => {
              setDivRef(el);
            }}
          >
            <Show when={props.showSubmitButtonOnTop ?? false}>
              <SubmitButton />
            </Show>

            <Show when={divRef()}>
              <FormContext.Provider value={formData}>
                <Show when={formData.groupByTabsAndGroup !== undefined}>
                  {/* Main Tab is displayed as top level fields */}
                  <For each={Object.keys(formData.groupByTabsAndGroup.main)}>
                    {(group) => (
                      <div
                        class="dx-fieldset"
                        style={{ "max-width": "100%" }}
                      >
                        <Show when={props.importExportButtons ?? true}>
                          {ImportExportButtons()}
                        </Show>

                        <div class="b:1 b:rgb(214,214,216) w:100% r:10|10|10|10 bg:rgb(237,237,237,.75)">
                          <div class={`p:5|15|15|15 w:full grid  grid-cols:1@<md gap:0|10 grid-cols:auto ${isPageDesignerPath(location.pathname) ? "" : "grid-cols:2"}`}>
                            <FormGroup
                              graph={graph}
                              setGraph={setGraph}
                              metaAttributes={
                                formData.groupByTabsAndGroup.main[group]
                              }
                              labelPrefix={"Form"}
                              vertex={formData.formData}
                              txnId={formData.txnId}
                            />
                          </div>
                        </div>
                      </div>
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
                  revertTransaction(formData.txnId, graph);
                  setDiscradPopup(false);
                  onConfirmExit();
                }}
                title="Discard changes"
                message="Discard unsaved changes - are you sure?"
              />
            </Show>
          </div>
        </RepeaterVertexContext.Provider>
      </Match>
    </Switch>
  );
}

// export default to make it client only
export default DynamicForm;
