// ADD a Feature:
// When nested PageViewWrapper is used, children should get parent context too.
import {
  batch,
  createMemo,
  createEffect,
  on,
  Match,
  Show,
  Switch,
  untrack,
} from "solid-js";

import { FormContext } from "~/components/form/context/FormContext";
import { DialogWithButtons } from "~/components/styled/modal/DeleteDialog";
import { SimpleAlert } from "~/components/styled/SimpleAlert";
import { PageView } from "~/features/page_attr_render/PageView";
import { usePreviewContext } from "~/features/page_designer/context/PreviewContext";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { NotFound } from "~/components/404";
import { AuthRequired } from "~/components/auth/AuthRequired";

import type {
  PageViewWrapperProps,
  PageViewConstants,
} from "./PageViewWrapper/types";
import { useVertexManagement } from "./PageViewWrapper/useVertexManagement";
import { usePermissions } from "./PageViewWrapper/usePermissions";
import { useMetadata } from "./PageViewWrapper/useMetadata";
import { useFormData } from "./PageViewWrapper/useFormData";
import { useLifecycle } from "./PageViewWrapper/useLifecycle";
import type {
  FetchFormDataResult,
  FetchFormMetaDataResult,
} from "~/pages/functions/fetchPageData";
import { SaveCancelButton } from "~/components/form/SaveCancelButton";
import { isDisabledTxn } from "~/lib/graph/transaction/value/isDisabledTxn";

export function PageViewWrapper(props: Readonly<PageViewWrapperProps>) {
  const [graph, setGraph] = useGraph();
  const id = createMemo(() =>
    props.dataId === "new" ? undefined : props.dataId,
  );

  // Initialize vertex management
  const { formStore, setFormStore, createErrorVertex } = useVertexManagement(
    props,
    {
      graph,
      setGraph,
      id,
    },
  );

  const metaTxnId = props.metaTxnId ?? generateNewTxnId(graph, setGraph);
  const metaVertex = () => graph.vertexes[formStore().P.formMetaId!];
  const dataVertex = () => graph.vertexes[formStore().P.formDataId!];

  const [previewStore] = usePreviewContext();

  const constants = (): PageViewConstants => ({
    get dataId() {
      return props.dataId;
    },
    get expression() {
      return props.expression;
    },
    get formDataId() {
      return props.formDataId;
    },
    get formId() {
      return props.formId;
    },
    get formMetaId() {
      return untrack(() => props.formMetaId);
    },
    get getFormData() {
      return !!props.getFormData;
    },
    get isDesignMode() {
      return props.isDesignMode;
    },
    get isNoPermissionCheck() {
      return props.isNoPermissionCheck;
    },
    get pageKeyName() {
      return props.pageKeyName;
    },
    get pageVertexName() {
      return props.pageVertexName;
    },
    get url() {
      return props.url;
    },
  });

  // Initialize metadata handling
  const { metaData, setFormMetaData } = useMetadata(props, {
    graph,
    setGraph,
    constants,
    setFormStore,
    metaTxnId,
    previewStore,
  });

  props.initializeFormStoreParent?.(formStore().id);

  const ContentSSR = () => {
    // Initialize form data handling
    const { handleFormData } = useFormData(props, {
      graph,
      setGraph,
      id,
      setFormStore,
      formStore,
      metaVertex,
      createErrorVertex,
    });
    const processResult = (result?: {
      formMetaId?: string;
      metaResult?: FetchFormMetaDataResult;
      dataResult?: FetchFormDataResult;
      error?: string;
    }) => {
      if (result) {
        batch(() => {
          setFormStore("error", "");
          if (result.error) {
            setFormStore("error", result.error);
          } else {
            setFormMetaData(result?.metaResult, result?.formMetaId);
            // const error = validationError();
            // if (error) {
            //   setFormStore("error", error);
            // } else {
            //   handleFormData(result?.dataResult);
            // }
            handleFormData(result?.dataResult);
          }
        });
      }
    };

    // Initial Data Set:
    processResult(metaData());
    // when refetched data, set it to state again:
    createEffect(
      on(
        metaData,
        () => {
          const result = metaData();
          if (result) {
            processResult(result);
          }
        },
        { defer: true },
      ),
    );

    // Initialize lifecycle hooks
    const { onConfirmExit } = useLifecycle(props, {
      graph,
      setGraph,
      formStore,
      setFormStore,
      metaTxnId,
    });

    const Content = () => (
      <PageView
        context={props.context}
        data={dataVertex()}
        id={id()}
        isNoPermissionCheck={props.isNoPermissionCheck}
        metaVertex={metaVertex()!}
        pageVertexName={props.pageVertexName}
        parentPreviewStore={previewStore}
      />
    );
    return (
      <>
        <Show when={formStore().P.error === "404"}>
          <NotFound error={""} />
        </Show>
        <Show when={formStore().P.error !== "404" && formStore().P.error}>
          <SimpleAlert type="error" message={formStore().P.error} />
        </Show>
        {/* <Show when={getGlobalStore(graph).P.isDevelopment}>
        <DebugPermissionInfo
          allConfiguredPermission={allConfiguredPermission()}
          authError={authError()}
          hasFullPermission={permissions.full() ?? false}
          hasEditPermission={permissions.edit() ?? false}
          hasCreatePermission={permissions.create() ?? false}
          hasViewPermission={permissions.view() ?? false}
          isNoPermissionCheck={isNoPermissionCheck()}
          metaVertexId={formStore().P.formMeta?.id}
          mounted={formStore().P.mounted}
          userRoles={getGlobalStore(graph).P.userRoles}
        />
      </Show> */}
        <Show
          fallback={<div>Data not found!</div>}
          when={
            metaData() &&
            (props.getFormData
              ? dataVertex() || !formStore().P.isFetching
              : true)
          }
        >
          <FormContext.Provider value={formStore().id}>
            <Switch>
              <Match
                when={
                  !formStore().P.error &&
                  metaVertex() &&
                  (props.dataId && props.dataId !== "new"
                    ? dataVertex() || formStore().P.isFetching
                    : true)
                }
              >
                <Content />
                <Show when={!(props.hideSaveCancelButton ?? true)}>
                  <SaveCancelButton
                    closePopUp={props.closePopUp}
                    disabled={isDisabledTxn(formStore().P.txnId, graph)}
                  />
                </Show>
              </Match>
            </Switch>
          </FormContext.Provider>
        </Show>
        <Show when={formStore().P.discardPopup}>
          <DialogWithButtons
            message="Discard unsaved changes - are you sure?"
            onCancel={() => setFormStore("discardPopup", false)}
            onConfirm={() => {
              revertTransaction(formStore().P.txnId, graph, setGraph);
              setFormStore("discardPopup", false);
              onConfirmExit();
            }}
            open={() => formStore().P.discardPopup}
            setOpen={setFormStore.bind(null, "discardPopup")}
            title="Discard changes"
          />
        </Show>
      </>
    );
  };

  return (
    <Show
      when={
        metaData() &&
        formStore().P.count &&
        (props.getFormData ? dataVertex() || !formStore().P.isFetching : true)
      }
    >
      <ContentSSR />
    </Show>
  );
}
