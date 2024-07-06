import { type BeforeLeaveEventArgs, useBeforeLeave, useLocation, useNavigate, } from "@solidjs/router";
import {
  For,
  type JSXElement,
  Match,
  Show,
  Switch,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";
import { type SetStoreFunction, type Store, createStore } from "solid-js/store";

import { DeleteDialog } from "~/components/DeleteDialog";
import { LoaderNew } from "~/components/LoaderSimple";
import { TableTabs } from "~/components/TableTabs";
import { formSubmit } from "~/components/form/formSubmit";
import { RepeaterVertexContext } from "~/components/page_attr_render/Context";
import { FormContext, type IFormContext } from "~/lib/contexts";
import { addStepComponentAttr } from "~/lib/drag_drop/drop/addStepComponentAttr";
import { GraphContext, type GraphInterface, type Id, type Vertex, } from "~/lib/graph/graph";
import { deleteTxnId, getNewTxnId, isDisabledTxn, revertTransaction, txnHasSteps, } from "~/lib/graph/transaction";
import { removeLastPathSegment } from "~/lib/removeLastPathSegment";
import { isPageDesignerPath } from "~/lib/utils";
import { setGraphData } from "~/lib/websocket/setGraphData";

import { useDesignerLayoutStore } from "../page_designer/LayoutContext";
import { FormGroup } from "./FormGroup";
import { ImportExportButtons } from "./ImportExportButtons";
import { SubmitButton } from "./SubmitButton";
import { getFormData } from "./getFormData";
import { getInitialFormState } from "./getInitialFormState";

export interface DynamicFormProps {
  buttonAlign?: string;
  closePopUp?: () => void;
  doMount?: boolean;
  formId: string;
  graph: Store<GraphInterface>;
  id?: Id;
  importExportButtons?: boolean;
  isLoginRegister?: string;
  meta?: Vertex;
  setGraph: SetStoreFunction<GraphInterface>;
  showMainFieldsOnly?: boolean;
  showSubmitButtonOnTop?: boolean;
  submitButton?: JSXElement;
}
export function DynamicForm(props: Readonly<DynamicFormProps>) {
  const id = createMemo(() => (props.id === "new" ? undefined : props.id));
  const navigate = useNavigate();
  const location = useLocation();
  const [graph, setGraph] = useContext(GraphContext)!;
  const cleanUpConfig = {} as { [key: string]: any };
  const txnId = getNewTxnId(graph, setGraph);
  const [_, setLayoutStore] = useDesignerLayoutStore() || [];

  const [formData, setFormData] = createStore({
    cleanUpConfig: () => cleanUpConfig,
    txnId,
  } as IFormContext);
  const [activeTab, setActiveTab] = createSignal("main");
  const [error, setError] = createSignal<null | string>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [divRef, setDivRef] = createSignal<HTMLDivElement>();
  const [popup, setPopup] = createSignal(false);
  const [discradPopup, setDiscradPopup] = createSignal(false);
  let onConfirmExit: () => void;

  const navigateToParentRoute = () => {
    navigate(removeLastPathSegment());
  };

  const onSubmit = formSubmit(formData,  props.closePopUp);

  const onCancel = () => {
    revertTransaction(txnId, graph);
    deleteTxnId(txnId, graph);
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
    const initFormStateResult = getInitialFormState(graph, setGraph, id(), txnId, props.formId);
    if (initFormStateResult.error) {
      setError(initFormStateResult.error);
      return;
    }
    setActiveTab(initFormStateResult.tabs![0]);
    setFormData({
      formData: graph.vertexes[id() as Id] ?? initFormStateResult.dataVertex!,
      formMeta: initFormStateResult.metaVertexResult!.vertex!,
      groupByTabsAndGroup: initFormStateResult.groupByTabsAndGroup,
      metaTxnId: initFormStateResult.metaVertexResult!.txnId,
      tabs: initFormStateResult.tabs,
      txnId,
    });

    if (initFormStateResult.dataVertex?.L[0] === "Form") {
      const layoutRowId = addStepComponentAttr(initFormStateResult.dataVertex, txnId, graph, setGraph);
      if (layoutRowId === -1) {
        setError("Layout Row Id Error");
        return;
      }
      // setLayoutStore('activeStepId', layoutRowId);
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
              <SubmitButton buttonAlign={props.buttonAlign} onCancel={onCancel} onSubmit={onSubmit} submitButton={props.submitButton}/>
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

                        <div class="b:1 b:rgb(214,214,216) bg:rgb(237,237,237,.75) r:10|10|10|10 w:100%">
                          <div class={`${isPageDesignerPath(location.pathname) ? "" : "grid-cols:2"} grid gap:0|10  grid-cols:auto grid-cols:1@<md p:5|15|15|15 w:full`}>
                            <FormGroup
                              graph={graph}
                              labelPrefix={"Form"}
                              metaAttributes={
                                formData.groupByTabsAndGroup.main[group]
                              }
                              setGraph={setGraph}
                              txnId={formData.txnId}
                              vertex={formData.formData}
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
                  <TableTabs setActiveTab={setActiveTab} tabs={formData.tabs} />
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
                            labelPrefix={""}
                            metaAttributes={
                              formData.groupByTabsAndGroup[activeTab()][group]
                            }
                            setGraph={setGraph}
                            txnId={formData.txnId}
                            vertex={formData.formData}
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
                  <SubmitButton buttonAlign={props.buttonAlign} disabled={isDisabledTxn(txnId, graph)} onCancel={onCancel} onSubmit={onSubmit} submitButton={props.submitButton}/>
                </Show>
              </FormContext.Provider>
            </Show>
            <Show when={popup()}>PopOver</Show>
            <Show when={discradPopup()}>
              <DeleteDialog
                message="Discard unsaved changes - are you sure?"
                onConfirm={() => {
                  revertTransaction(formData.txnId, graph);
                  setDiscradPopup(false);
                  onConfirmExit();
                }}
                open={discradPopup()}
                title="Discard changes"
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
