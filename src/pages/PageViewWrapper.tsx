import { makeEventListener } from "@solid-primitives/event-listener";
import { type BeforeLeaveEventArgs, useBeforeLeave } from "@solidjs/router";
import {
  createEffect,
  createMemo,
  Match,
  on,
  onCleanup,
  onMount,
  Show,
  Switch,
  untrack,
} from "solid-js";
import { isServer } from "solid-js/web";
import { v7 as uuidv7 } from "uuid";

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import {
  FormContext,
  type FormStoreObject,
  getInitialFormStore,
} from "~/components/form/context/FormContext";
import { addFormInitialComponent } from "~/components/form/functions/addFormInitialComponent";
import { getFormData } from "~/components/form/functions/getFormData";
import { SaveCancelButton } from "~/components/form/SaveCancelButton";
import { DialogWithButtons } from "~/components/styled/DeleteDialog";
import { PreviewPage } from "~/components/styled/PreviewPage";
import { SimpleWarningAlert } from "~/components/styled/SimpleWarningAlert";
import { fetchComponentData } from "~/cypher/get/fetchComponentData";
import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { PageView } from "~/features/page_attr_render/PageView";
import {
  getConfiguredPermissions,
  hasPermissions,
} from "~/features/page_attr_render/permissions";
import { usePreviewContext } from "~/features/page_designer/context/PreviewContext";
import { generateFormMetaAttributes } from "~/features/page_designer/functions/generateFormMetaAttributes";
import { PageDesignerLabels } from "~/features/page_designer/functions/PageDesignerLabels";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { isObject } from "~/lib/data_structure/object/isObject";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/edge/getEdgesFromRowsAttr";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/core/setGraphData";
import {
  addNewVertex,
  deleteVertex,
  mergeVertexProperties,
  newVertex,
} from "~/lib/graph/mutate/core/vertex";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { createMeta } from "~/lib/graph/mutate/form/createMeta";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { createCompContextVertex } from "~/lib/graph/mutate/vertex/createCompContextVertex";
import { createViewVertex } from "~/lib/graph/mutate/vertex/createViewVertex";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { revertTransaction } from "~/lib/graph/transaction/revert/revertTransaction";
import { saveStepIndex } from "~/lib/graph/transaction/steps/saveStepIndex";
import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";
import { setPreventUndoAtOrBeforeIndex } from "~/lib/graph/transaction/steps/setPreventUndoAtOrBeforeIndex";
import { isDisabledTxn } from "~/lib/graph/transaction/value/isDisabledTxn";
import {
  parentComponentAttribute,
  parentTemplateAttribute,
} from "~/lib/meta/base/Comp";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { fetchFormData, fetchFormMetaData } from "./functions/fetchPageData";

export function PageViewWrapper(
  props: Readonly<{
    closePopUp?: () => void;
    context?: Record<string, unknown>;
    dataId?: Id;
    dontConfirmExit?: boolean;
    enableSEO?: boolean;
    expression?: string;
    formDataId?: Id;
    formId?: string;
    formMetaId?: Id;
    getFormData?: () => Promise<ServerResult>;
    hideSaveCancelButton?: boolean;
    initializeFormStoreParent?: (formStoreId: Id) => void;
    isNoPermissionCheck?: boolean;
    metaTxnId?: number;
    pageId?: string;
    pageVertexLabel?: string;
    pageVertexName?: string;
    parentId?: Id;
    txnId?: string;
    uuid?: string;
    // openedFormId?: Id;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const id = createMemo(() =>
    props.dataId === "new" ? undefined : props.dataId,
  );
  const layoutStoreId = props.uuid ?? uuidv7();
  const viewVertexObject = createViewVertex(
    { view: "Desktop" },
    graph,
    setGraph,
  );
  const componentVertexObject = createCompContextVertex({}, graph, setGraph);
  const initialFormStore = getInitialFormStore(graph, setGraph);
  const pageFormVertexObject = newVertex(layoutStoreId, ["PageForm"], {
    ...initialFormStore,
    componentValue: componentVertexObject.id,
    formId: props.pageVertexName,
    id: id()!,
    openedViews: [viewVertexObject.id],
    txnId: props.txnId ?? initialFormStore.txnId,
  });

  addNewVertex(0, pageFormVertexObject, graph, setGraph);

  const formStore = () =>
    graph.vertexes[pageFormVertexObject.id] as Vertex<FormStoreObject>;
  const setFormStore = (key: string, value: any) => {
    mergeVertexProperties<FormStoreObject>(
      0,
      pageFormVertexObject.id,
      graph,
      setGraph,
      { [key]: value },
    );
  };

  onCleanup(() => {
    for (const viewId of formStore()?.P?.openedViews ?? []) {
      deleteVertex(0, viewId, graph, setGraph);
    }
  });

  onCleanup(() => {
    deleteVertex(0, componentVertexObject.id, graph, setGraph);
  });

  // Note: onCleanUp will be called on reverse order of the cleanup functions
  onCleanup(() => {
    deleteVertex(0, pageFormVertexObject.id, graph, setGraph);
  });

  let onConfirmExit: () => void;
  const metaTxnId = props.metaTxnId ?? generateNewTxnId(graph, setGraph);

  const [previewStore] = usePreviewContext();

  const isNoPermissionCheck = createMemo(
    () =>
      props.isNoPermissionCheck ||
      // @ts-expect-error ignore
      formStore().P.formMetaData?.isNoPermissionCheck ||
      previewStore.isNoPermissionCheck,
  );
  const allConfiguredPermission = createMemo(() =>
    getConfiguredPermissions(
      getGlobalStore(graph).P.userRoles,
      graph.vertexes[formStore().P.formMetaId!]!,
      graph,
      setGraph,
    ),
  );

  const permissions = {
    delete: createMemo(() => checkPermission("delete")),
    edit: createMemo(() => checkPermission("edit")),
    insert: createMemo(() => checkPermission("insert")),
    view: createMemo(() => checkPermission("view")),
  };

  function checkPermission(action: string) {
    // if (!formStore()?.P.formMetaData) {
    //   return false;
    // }
    return (
      isNoPermissionCheck() ||
      (action === "insert" &&
        !id() &&
        hasPermissions(allConfiguredPermission(), action, graph, setGraph)) ||
      (!!id() &&
        hasPermissions(allConfiguredPermission(), action, graph, setGraph))
    );
  }

  // TODO: Dont set on store:
  setFormStore("hasDeletePermission", permissions.delete());
  setFormStore("hasEditPermission", permissions.edit());
  setFormStore("hasInsertPermission", permissions.insert());
  setFormStore("hasViewPermission", permissions.view());
  setFormStore("isNoPermissionCheck", isNoPermissionCheck());

  const authError = createMemo(() => {
    if (id() && !(permissions.edit() || permissions.view())) {
      return `You are not authorized to edit or view ${props.pageVertexName}`;
    }
    if (!(id() || permissions.insert())) {
      return `You are not authorized to insert ${props.pageVertexName}`;
    }
    return "";
  });

  // State mutation functions
  async function handleFormMetaData() {
    if (props.formMetaId) {
      setFormStore("formMetaId", props.formMetaId);
      return true;
    }
    const result = await fetchFormMetaData(
      graph,
      props.pageVertexName,
      props.pageVertexLabel,
      props.formId,
      props.expression
    );

    if (result.error) {
      setFormStore("error", result.error);
      return false;
    }

    let form = result.form;
    if (result.data) {
      if (props.formId && graph.vertexes[props.formId]) {
        delete result.data.graph!.vertexes[props.formId];
      }
      setGraphData(graph, setGraph, result.data.graph!);
      if (Array.isArray(result.data.result)) {
        if (result.data.result.length > 0) {
          setFormStore("formMetaId", result.data.result[0].id);
        }
      } else if (isObject(result.data.result)) {
        setFormStore("formMetaId", result.data.result.id);
      }
      if (
        formStore()?.P.formMetaId &&
        graph.vertexes[formStore().P.formMetaId!]!
      ) {
        form = generateFormMetaAttributes(
          graph,
          setGraph,
          graph.vertexes[formStore().P.formMetaId!]!,
        );
      }
    } else if (result.formMetaId) {
      setFormStore("formMetaId", result.formMetaId);
    }

    if (!props.formMetaId && !form) {
      setFormStore("error", `${props.pageVertexName} is not configured`);
      return false;
    }
    if (form) {
      let formToUse = form;
      // improve performance
      if (PageDesignerLabels.includes(form.key!) || form.key === "Component") {
        formToUse = {
          ...form,
          attributes: form.attributes.map((attr) => ({
            ...attr,
            attributes: attr.attributes?.filter((a) => a.key !== "Attr"),
          })),
        };
      }

      const metaVertexResult = untrack(() =>
        createMeta(formToUse!, metaTxnId, graph, setGraph)
      );

      if (metaVertexResult.error) {
        return false;
      }
      setFormStore("formMetaId", metaVertexResult.vertex!.id);
    }

    setFormStore("formMetaData", form);
    setFormStore("isPreview", props.pageId === "preview");
    return true;
  }

  function hasRequiredPermissions() {
    return (
      formStore().P.formMetaData &&
      (permissions.insert() || permissions.edit() || permissions.view())
    );
  }
  async function handleFormData() {
    const result = await fetchFormData(
      graph,
      props.getFormData,
      props.formDataId,
      id(),
      isNoPermissionCheck(),
      hasRequiredPermissions(),
      props.pageVertexName,
      formStore().P.formMetaData?.attributes
    );

    if (result.error) {
      setFormStore("error", result.error);
      return;
    }
    if (result.data?.graph) {
      setGraphData(graph, setGraph, result.data.graph);
    }
    if (result.componentData?.graph) {
      setGraphData(graph, setGraph, result.componentData.graph!);
    }
    const formDataId = result.data?.result?.[0]?.id;
    if (formDataId) {
      setFormStore("formDataId", formDataId);
    } else if (props.formDataId) {
      setFormStore("formDataId", props.formDataId);
    } else if (!id()) {
      const createResult = createFormVertex(
        graph,
        setGraph,
        formStore().P.txnId,
        graph.vertexes[formStore().P.formMetaId!]!.P.key,
        {},
      );

      if (createResult.error) {
        setFormStore("error", createResult.error);
        return;
      }

      // we cant save the dataId again, because its used as a prop and giving some error
      // if (props.openedFormId) {
      //   mergeVertexProperties(0, props.openedFormId, graph, setGraph, {
      //     dataId: createResult.vertex!.id
      //   });
      // }
      // Link to parent page
      if (
        props.parentId &&
        (props.pageVertexName === "Template" ||
          props.pageVertexName === "Component")
      ) {
        const parentComponentMetaVertex = {
          id: "",
          IN: {},
          L: [],
          OUT: {},
          P:
            props.pageVertexName === "Template"
              ? parentTemplateAttribute
              : parentComponentAttribute,
        } as Vertex;
        setSelectionValue(
          formStore().P.txnId,
          createResult.vertex!,
          graph,
          setGraph,
          parentComponentMetaVertex,
          props.parentId,
        );
      }

      setFormStore("formDataId", createResult.vertex!.id);

      if (!id() && graph.vertexes[formStore().P.formDataId!]?.L[0] === "Form") {
        const layoutId = addFormInitialComponent(
          graph.vertexes[formStore().P.formDataId!],
          graph,
          formStore().P.txnId,
          setGraph,
        );
        if (layoutId === -1) {
          setFormStore("error", "Adding component to layout failed");
          return;
        }
      }
    }

    if (!(props.parentId || props.txnId)) {
      setPreventUndoAtOrBeforeIndex(formStore().P.txnId, graph, setGraph);
    }
    saveStepIndex(formStore().P.txnId, "initial", graph, setGraph);
    saveUndoPoint(formStore().P.txnId, graph, setGraph);
  }

  // Initialize data loading immediately
  const loadInitialData = async () => {
    if (!(await handleFormMetaData())) {
      return;
    }

    if (formStore().P.formMetaId && !isNoPermissionCheck() && !graph.vertexes[formStore().P.formMetaId!]!.P.public) {
      setFormStore("error", `${props.pageVertexName} ${props.pageVertexLabel} is not authorized`);
      return;
    }

    if (!graph.vertexes[formStore().P.formMetaId!]) {
      setFormStore("error", "No form meta data found");
      return;
    }

    if (!graph.vertexes[formStore().P.formMetaId!]?.P.key) {
      setFormStore("error", `No key for the ${props.pageVertexName}`);
      return;
    }

    props.initializeFormStoreParent?.(pageFormVertexObject.id);
    await handleFormData();
  };

  // Start loading data immediately
  onMount(() => {
    loadInitialData();
    setFormStore("mounted", true);
  })

  createEffect(
    on(
      () => props.formId ?? "new",
      () => setFormStore("count", formStore().P.count + 1),
      { defer: true },
    ),
  );

  createEffect(
    on(
      () => props.expression ?? "new",
      async () => {
        setFormStore("formMetaId", undefined);
        setFormStore("formDataId", undefined);
        await handleFormMetaData();
      },
      { defer: true },
    ),
  );

  onCleanup(() => {
    revertTransaction(metaTxnId, graph, setGraph);
  });
  onCleanup(() => {
    // TODO: Remove all the meta
  });

  // Each open tab will be hidden and have its own useBeforeLeave callback
  useBeforeLeave((e: BeforeLeaveEventArgs) => {
    if (props.dontConfirmExit) {
      // allow navigation
      return;
    }
    if (isDisabledTxn(formStore().P.txnId, graph)) {
      // allow navigation
      return;
    }

    // preventDefault to block immediately and prompt user async
    e.preventDefault();
    setTimeout(() => {
      setFormStore("discardPopup", true);
    }, 100);
    onConfirmExit = () => {
      // user wants to proceed anyway so retry with force=true
      e.retry(true);
    };
  });

  const beforeunload = (event: BeforeUnloadEvent) => {
    if (!isDisabledTxn(formStore().P.txnId, graph)) {
      event.preventDefault();
      event.returnValue = ""; // Chrome requires returnValue to be set
    }
  };
  if (!isServer) {
    makeEventListener(window, "beforeunload", beforeunload);
  }

  const Content = () => (
    <PageView
      context={props.context}
      data={graph.vertexes[formStore().P.formDataId!]}
      hasDeletePermission={permissions.delete()}
      hasEditPermission={permissions.edit()}
      hasInsertPermission={permissions.insert()}
      hasViewPermission={permissions.view()}
      id={id()}
      isNoPermissionCheck={isNoPermissionCheck()}
      metaVertex={graph.vertexes[formStore().P.formMetaId!]!}
    />
  );

  return (
    <Show keyed when={formStore().P.count}>
      {/* <Show when={props.enableSEO}>
        <Show when={graph.vertexes[formStore().P.formMetaId!]?.P.seoTitle}>
          <SiteTitle>
            {getPageTitle(graph.vertexes[formStore().P.formMetaId!]!)}
          </SiteTitle>
        </Show>
        <Show
          when={graph.vertexes[formStore().P.formMetaId!]?.P.seoDescription}
        >
          <Meta
            content={
              graph.vertexes[formStore().P.formMetaId!]!.P.seoDescription
            }
            name="description"
          />
        </Show>
      </Show> */}

      <Switch>
        <Match when={formStore().P.error}>
          <SimpleWarningAlert message={formStore().P.error} />
        </Match>
        <Match when={authError()}>
          <SimpleWarningAlert message={authError()} />
        </Match>
      </Switch>

      {/* <Show when={getGlobalStore(graph).P.isDevelopment}>
        <DebugPermissionInfo
          allConfiguredPermission={allConfiguredPermission()}
          authError={authError()}
          hasDeletePermission={hasDeletePermission() ?? false}
          hasEditPermission={hasEditPermission() ?? false}
          hasInsertPermission={hasInsertPermission() ?? false}
          hasViewPermission={hasViewPermission() ?? false}
          isNoPermissionCheck={isNoPermissionCheck()}
          metaVertexId={formStore().P.formMeta?.id}
          mounted={formStore().P.mounted}
          userRoles={getGlobalStore(graph).P.userRoles}
        />
      </Show> */}
      <Show
        fallback={<div>Data not found!</div>}
        when={graph.vertexes[formStore().P.formDataId!]}
      >
        <FormContext.Provider value={formStore().id}>
          <Switch>
            <Match
              when={
                !authError() &&
                formStore().P.mounted &&
                graph.vertexes[formStore().P.formMetaId!]! &&
                (props.dataId && props.dataId !== "new"
                  ? graph.vertexes[formStore().P.formDataId!]
                  : true)
              }
            >
              <Switch>
                <Match when={!formStore().P.isPreview}>
                  <Content />
                </Match>
                <Match when={formStore().P.isPreview}>
                  <PreviewPage>
                    <Content />
                  </PreviewPage>
                </Match>
              </Switch>

              <Show when={isNoPermissionCheck() && !props.hideSaveCancelButton}>
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
    </Show>
  );
}
