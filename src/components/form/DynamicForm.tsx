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
  useContext,
} from "solid-js";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import { isPageDesignerPath } from "~/lib/utils";
import { GraphContext, type GraphInterface, type Id, type Vertex, } from "~/lib/graph/graph";
import { getNewTxnId, revertTransaction, txnHasSteps, } from "~/lib/graph/transaction";
import { type BeforeLeaveEventArgs, useBeforeLeave, useLocation, useNavigate, } from "@solidjs/router";
import { TableTabs } from "~/components/TableTabs";
import { useToast } from "~/components/Toast";
import { DeleteDialog } from "~/components/DeleteDialog";
import { setGraphData } from "~/lib/websocket/setGraphData";
import { FormContext, type IFormContext } from "~/lib/contexts";
import { FormGroup } from "./FormGroup";
import { LoaderNew } from "~/components/LoaderSimple";
import { RepeaterVertexContext } from "~/components/page_attr_render/Context";
import { getFormData } from "./getFormData";
import { addFormComponentAttr } from "~/components/form/addFormComponentAttr";
import { useDesignerLayoutStore } from "../page_designer/LayoutContext";
import { removeLastPathSegment } from "~/lib/removeLastPathSegment";
import { formSubmit } from "~/components/form/formSubmit";
import { getInitialState } from "./getInitialState";
import { ImportExportButtons } from "./ImportExportButtons";
import { SubmitButton } from "./SubmitButton";

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
    const initFormStateResult = getInitialState(graph, setGraph, id(), txnId, props.formId);
    if (initFormStateResult.error) {
      setError(initFormStateResult.error);
      return;
    }
    setActiveTab(initFormStateResult.tabs![0]);
    setFormData({
      txnId,
      formMeta: initFormStateResult.metaVertexResult!.vertex!,
      formData: graph.vertexes[id() as Id] ?? initFormStateResult.dataVertex!,
      tabs: initFormStateResult.tabs,
      groupByTabsAndGroup: initFormStateResult.groupByTabsAndGroup,
      metaTxnId: initFormStateResult.metaVertexResult!.txnId,
    });

    if (initFormStateResult.dataVertex?.L[0] === "Form") {
      const layoutRowId = addFormComponentAttr(graph, initFormStateResult.dataVertex, txnId, setGraph);
      if (layoutRowId === -1) {
        setError("Layout Row Id Error");
        return;
      }
      setLayoutStore('activeStepId', layoutRowId);
    }
    setLayoutStore?.("formData", formData);
    setIsLoading(false);

    if (props.doMount === null || props.doMount !== false)
      divRef()?.querySelector?.("input")?.focus();
  });

  onCleanup(() => {
    // @ts-ignore
    setLayoutStore?.("formData", undefined);

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
              <SubmitButton onCancel={onCancel} onSubmit={onSubmit} buttonAlign={props.buttonAlign} submitButton={props.submitButton}/>
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
                          <ImportExportButtons setPopup={setPopup} />
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
                  <SubmitButton onCancel={onCancel} onSubmit={onSubmit} buttonAlign={props.buttonAlign} submitButton={props.submitButton}/>
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
