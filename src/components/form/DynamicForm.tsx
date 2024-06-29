import {
  createMemo,
  createSignal,
  For,
  type JSXElement,
  Match,
  onCleanup,
  onMount,
  Show,
  Switch,
  untrack,
  useContext,
} from "solid-js";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import { groupBy, isPageDesignerPath } from "~/lib/utils";
import { getChildVertexes } from "~/lib/graph/get/sync/traverse";
import { createMeta } from "~/lib/graph/mutate/form/metaFunction";
import { createForm } from "~/lib/graph/mutate/form/createForm";
import { GraphContext, type GraphInterface, type Id, type Vertex, } from "~/lib/graph/graph";
import { commitTxn, getNewTxnId, ProcessStatus, revertTransaction, txnHasSteps, } from "~/lib/graph/transaction";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import { type BeforeLeaveEventArgs, useBeforeLeave, useLocation, useNavigate, } from "@solidjs/router";
import { TableTabs } from "~/components/TableTabs";

import { submitDataCall } from "~/lib/api/api_functions";
import { useToast } from "~/components/Toast";
import { DeleteDialog } from "~/components/DeleteDialog";
import { setGraphData } from "~/lib/websocket/setGraphData";
import { FormContext, type IFormContext } from "~/lib/contexts";
import { FormGroup } from "./FormGroup";
import { LoaderNew } from "~/components/LoaderSimple";
import { Icon } from "@iconify-icon/solid";
import { RepeaterVertexContext } from "~/components/page_attr_render/Context";
import { checkIfNameExistsMGCall } from "~/cypher/get/checkIfNameExists";
import { FormMetaData } from "~/lib/formMetaData";
import { FormMetaDataAuth } from "~/lib/formMetaDataAuth";
import { getFormData } from "./getFormData";
import { addFormComponentAttr } from "~/components/form/addFormComponentAttr";
import { useDesignerLayoutStore } from "../page_designer/LayoutContext";
import { removeLastPathSegment } from "~/lib/removeLastPathSegment";
import { formSubmit } from "~/components/form/formSubmit";

export interface DynamicFormProps {
  meta?: Vertex;
  id?: Id;
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
  closePopUp?: () => void;
}

export function DynamicForm(props: Readonly<DynamicFormProps>) {
  const id = createMemo(() => (props.id === "new" ? undefined : props.id));
  const { Ws } = useContext(WsContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoadingToast, showWarningToast, showErrorToast } = useToast();
  const [graph, setGraph] = useContext(GraphContext)!;
  const cleanUpConfig = {} as { [key: string]: any };
  const txnId = getNewTxnId(graph, setGraph);
  const [_, setLayoutStore] = useDesignerLayoutStore();

  const [formData, setFormData] = createStore({
    txnId,
    cleanUpConfig: () => cleanUpConfig,
  } as IFormContext);
  const [activeTab, setActiveTab] = createSignal("main");
  const [error, setError] = createSignal<string | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [divRef, setDivRef] = createSignal<HTMLDivElement>();
  const [popup, setPopup] = createSignal(false);
  const [discradPopup, setDiscradPopup] = createSignal(false);
  let onConfirmExit: () => void;

  const navigateToParentRoute = () => {
    navigate(removeLastPathSegment());
  };

  const initFormState = () => {
    let dataVertex: Vertex;
    if (!id()) {
      const createResult = createForm(
        graph,
        setGraph,
        txnId,
        Ws,
        props.formId,
      );

      dataVertex = createResult.vertex!;

      if (dataVertex?.L[0] === "Form") {
        const layoutRowId = addFormComponentAttr(graph, dataVertex, txnId, setGraph);
        if (layoutRowId === -1) return;
        setLayoutStore('activeStepId', layoutRowId);
      }
    }
    const form =
      FormMetaData[props.formId] || (FormMetaDataAuth[props.formId]);

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
      metaTxnId: metaVertexResult.txnId,
    });

    setLayoutStore?.("formData", formData);
  }

  const onSubmit = async () => {
    return formSubmit(formData, id() as Id, txnId, graph, setGraph, showLoadingToast, showWarningToast, showErrorToast, navigateToParentRoute, props.closePopUp);
  };

  const onCancel = () => {
    revertTransaction(txnId, graph);
    if (!props.closePopUp) {
      navigateToParentRoute();
    } else {
      props.closePopUp();
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
      <button
        type="button"
        style={{ display: "flex" }}
        onClick={() => setPopup(true)}
      >
        <Icon
          icon={"lets-icons:import"}
          height={22}
          width={22}
        />
        Import
      </button>
      <button
        type="button"
        style={{ display: "flex" }}
        onClick={() => setPopup(true)}
        class="b:blue"
      >
        <Icon
          icon={"lets-icons:export"}
          height={22}
          width={22}
        />
        Export
      </button>
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
      const data = await getFormData(props.formId, id()!);
      if (data.error) {
        setError(data.error);
      } else if (data.graph) {
        setGraphData(
          graph,
          setGraph,
          data.graph,
        );
      }
    }
    initFormState();
    setIsLoading(false);
  });

  onMount(() => {
    if (props.doMount === null || props.doMount !== false)
      divRef()?.querySelector?.("input")?.focus();
  });

  onCleanup(() => {
    setLayoutStore?.("formData", undefined);
  });

  onCleanup(() => {
    for (const rowMetaTxnId of cleanUpConfig.rowMetaTxnIds || [])
      revertTransaction(rowMetaTxnId, graph);
  });

  useBeforeLeave((e: BeforeLeaveEventArgs) => {
    // TODO: only consider not submitted steps
    if (!txnHasSteps(formData.txnId, graph)) {
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
