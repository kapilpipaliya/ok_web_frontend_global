import {
  type BeforeLeaveEventArgs,
  useBeforeLeave,
  useLocation,
} from "@solidjs/router";
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
} from "solid-js";
import { type SetStoreFunction, type Store, createStore } from "solid-js/store";

import { DeleteDialog } from "~/components/DeleteDialog";
import { LoaderNew } from "~/components/LoaderSimple";
import { TableTabs } from "~/components/TableTabs";
import {
  RepeaterVertexContext,
  useRepeaterVertexContext,
} from "~/components/page_attr_render/Context";
import { FormContext, type IFormContext } from "~/lib/contexts";
import {
  type GraphInterface,
  type Id,
  type Vertex,
  useGraph,
} from "~/lib/graph/graph";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { isPageDesignerPath } from "~/lib/utils";
import { setGraphData } from "~/lib/websocket/setGraphData";

import { useDesignerLayoutStore } from "../page_designer/LayoutContext";
import { FormGroup } from "./FormGroup";
import { ImportExportButtons } from "./ImportExportButtons";
import { SaveCancelButton } from "./SaveCancelButton";
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

  const location = useLocation();
  const [graph, setGraph] = useGraph();
  const cleanUpConfig = {} as { [key: string]: any };
  const txnId = graph.newTxnId;
  const [, setLayoutStore] = useDesignerLayoutStore() || [];

  const [formData, setFormData] = createStore<IFormContext>({
    cleanUpConfig: () => cleanUpConfig,
    txnId,
  });
  const [activeTab, setActiveTab] = createSignal("main");
  const [error, setError] = createSignal<null | string>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [divRef, setDivRef] = createSignal<HTMLDivElement>();
  const [popup, setPopup] = createSignal(false);
  const [discardPopup, setDiscardPopup] = createSignal(false);
  let onConfirmExit: () => void;

  onMount(async () => {
    setIsLoading(true);
    if (id()) {
      const data = await getFormData(props.formId, id()!);
      if (data.error) {
        setError(data.error);
      } else if (data.graph) {
        setGraphData(graph, setGraph, data.graph);
      }
    }
    const initFormStateResult = getInitialFormState(
      graph,
      setGraph,
      id(),
      txnId,
      props.formId,
    );
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

    setLayoutStore?.("formData", formData);
    setIsLoading(false);

    if (props.doMount === null || props.doMount !== false)
      divRef()?.querySelector?.("input")?.focus();
  });

  onCleanup(() => {
    // @ts-expect-error ignore
    setLayoutStore?.("formData", undefined);

    for (const rowMetaTxnId of cleanUpConfig.rowMetaTxnIds || [])
      revertTransaction(rowMetaTxnId, graph);
  });

  useBeforeLeave((e: BeforeLeaveEventArgs) => {
    e.preventDefault();
    setTimeout(() => {
      setDiscardPopup(true);
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
          value={[formData.formData, ...useRepeaterVertexContext()]}
        >
          <FormContext.Provider value={formData}>
            <div ref={setDivRef}>
              <Show when={props.showSubmitButtonOnTop ?? false}>
                <SaveCancelButton
                  buttonAlign={props.buttonAlign}
                  closePopUp={props.closePopUp}
                  disabled={isDisabledTxn(txnId, graph)}
                  submitButton={props.submitButton}
                />
              </Show>

              <Show when={formData.groupByTabsAndGroup !== undefined}>
                {/* Main Tab is displayed as top level fields */}
                <For each={Object.keys(formData.groupByTabsAndGroup.main)}>
                  {(group) => (
                    <div class="dx-fieldset max-w:100%">
                      <Show when={props.importExportButtons ?? true}>
                        <ImportExportButtons setPopup={setPopup} />
                      </Show>

                      <div class="b:1 b:rgb(214,214,216) bg:rgb(237,237,237,.75) r:10|10|10|10 w:100%">
                        <div
                          class={`${isPageDesignerPath(location.pathname) ? "" : "grid-cols:2"} grid gap:0|10 grid-cols:auto grid-cols:1@<md p:5|15|15|15 w:full`}
                        >
                          <FormGroup
                            graph={graph}
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
                  each={Object.keys(formData.groupByTabsAndGroup[activeTab()])}
                >
                  {(group) => (
                    <div class="dx-fieldset">
                      <Show when={group !== "main"}>
                        <div class="dx-fieldset-header">{group}</div>
                      </Show>
                      <FormGroup
                        graph={graph}
                        metaAttributes={
                          formData.groupByTabsAndGroup[activeTab()][group]
                        }
                        setGraph={setGraph}
                        txnId={formData.txnId}
                        vertex={formData.formData}
                      />
                    </div>
                  )}
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
                <SaveCancelButton
                  buttonAlign={props.buttonAlign}
                  closePopUp={props.closePopUp}
                  disabled={isDisabledTxn(txnId, graph)}
                  submitButton={props.submitButton}
                />
              </Show>

              <Show when={popup()}>PopOver</Show>
              <Show when={discardPopup()}>
                <DeleteDialog
                  message="Discard unsaved changes - are you sure?"
                  onConfirm={() => {
                    revertTransaction(formData.txnId, graph);
                    setDiscardPopup(false);
                    onConfirmExit();
                  }}
                  open={discardPopup()}
                  title="Discard changes"
                />
              </Show>
            </div>
          </FormContext.Provider>
        </RepeaterVertexContext.Provider>
      </Match>
    </Switch>
  );
}

// export default to make it client only
export default DynamicForm;
