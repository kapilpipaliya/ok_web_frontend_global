import { Meta, Title } from "@solidjs/meta";
import { type BeforeLeaveEventArgs, useBeforeLeave } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
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
import { createStore } from "solid-js/store";

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { DialogWithButtons } from "~/components/DeleteDialog";
import {
  FormContext,
  type FormStore,
  getInitialFormStore,
} from "~/components/form/FormContext";
import { addFormInitialComponent } from "~/components/form/functions/addFormInitialComponent";
import { SaveCancelButton } from "~/components/form/SaveCancelButton";
import {
  getConfiguredPermissions,
  hasPermissions,
} from "~/components/page_attr_render/permissions";
import { generateFormMetaAttributes } from "~/components/page_designer/functions/getChildrenAttrs";
import { getPageTitle } from "~/components/page_designer/layout/getPageTitle";
import { usePreviewContext } from "~/components/page_designer/PreviewContext";
import PreviewPage from "~/components/PreviewPage";
import { SimpleWarningAlert } from "~/components/SimpleWarningAlert";
import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { isObject } from "~/lib/data_structure/object/isObject";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { type Id, useGraph } from "~/lib/graph/graph";
import { createMeta } from "~/lib/graph/mutate/form/createMeta";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { saveStepIndex } from "~/lib/graph/transaction/saveStepIndex";
import { saveUndoPoint } from "~/lib/graph/transaction/saveUndoPoint";
import { setPreventUndoAtOrBeforeIndex } from "~/lib/graph/transaction/setPreventUndoAtOrBeforeIndex";
import { FormMetaData } from "~/lib/meta/formMetaData";
const PageView = clientOnly(
  () => import("~/components/page_attr_render/PageView"),
);

export function PageViewWrapper(
  props: Readonly<{
    closePopUp?: () => void;
    dataId?: Id;
    enableSEO?: boolean;
    expression?: string;
    formId?: string;
    initializeFormStoreParent?: (formStore: FormStore) => void;
    isNoPermissionCheck?: boolean;
    pageId?: string;
    pageVertexLabel?: string;
    pageVertexName?: string;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const pageFormStore = createStore(getInitialFormStore(graph));
  const [formStore, setFormStore] = pageFormStore;

  setFormStore({
    get formId() {
      return props.pageVertexName;
    },
  });
  let onConfirmExit: () => void;
  const metaTxnId = graph.newTxnId;
  const id = createMemo(() =>
    props.dataId === "new" ? undefined : props.dataId,
  );
  const [previewStore] = usePreviewContext();

  const isNoPermissionCheck = createMemo(() =>
    props.isNoPermissionCheck ||
    formStore.formMetaData?.isNoPermissionCheck ||
    previewStore.isNoPermissionCheck,
  );
  const allConfiguredPermission = createMemo(() =>
    getConfiguredPermissions(graph.userRoles, formStore.formMeta, graph, setGraph),
  );
  
  const permissions = {
    delete: createMemo(() => checkPermission("delete")),
    edit: createMemo(() => checkPermission("edit")),
    insert: createMemo(() => checkPermission("insert")),
    view: createMemo(() => checkPermission("view")),
  };

  function checkPermission(action: string) {
    if (!formStore.formMetaData) { return false; }
    return (
      isNoPermissionCheck() ||
      (action === "insert" && !id() && hasPermissions(allConfiguredPermission(), action, graph, setGraph)) ||
      (!!id() && hasPermissions(allConfiguredPermission(), action, graph, setGraph))
    );
  }

  setFormStore({
    get hasDeletePermission() { return permissions.delete(); },
    get hasEditPermission() { return permissions.edit(); },
    get hasInsertPermission() { return permissions.insert(); },
    get hasViewPermission() { return permissions.view(); },
    get isNoPermissionCheck() { return isNoPermissionCheck(); },
  });

  const authError = createMemo(() => {
    if (id() && !(permissions.edit() || permissions.view())) {
      return `You are not authorized to edit or view ${props.pageVertexName}`;
    }if (!(id() || permissions.insert())) {
      return `You are not authorized to insert ${props.pageVertexName}`;
    }
    return "";
  });

  const metaDtaInitialize = (data: ServerResult) => {
    if (props.formId) {
      delete data.graph.vertexes[props.formId];
    }
    setGraphData(graph, setGraph, data.graph);

    if (Array.isArray(data.result)) {
      if (data.result.length > 0) {
        const metaVertex_ = graph.vertexes[data.result[0].id];
        setFormStore("formMeta", metaVertex_);
      }
    } else if (isObject(data.result)) {
      const metaVertex_ = graph.vertexes[data.result.id];
      setFormStore("formMeta", metaVertex_);
    }
  };

  // load form meta data
  async function loadFormDesignerMetaData() {
    // let form = props.pageVertexLabel ? FormMetaData[props.pageVertexLabel] : null;
    let form: IFormMetaData | null = null;
    if (!form && props.pageVertexName && FormMetaData[props.pageVertexName]) {
      form = FormMetaData[props.pageVertexName];
    }
    if (!form || props.pageVertexLabel === "Form") {
      form = FormMetaData.Form;
      const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);

      const data = await fetchDataFromMG({
        expression:
          props.expression ??
          (props.formId
            ? `id:'${props.formId}'`
            : `g:'${props.pageVertexLabel ?? "Form"}[${props.pageVertexName}]'`),
        incoming,
        outgoing,
      });
      if (!(isValidResponse(data) && data.result) || data.result.length === 0) {
        setFormStore("error", `No ${props.pageVertexName} configured`);
        return;
      }
      metaDtaInitialize(data);
      if (formStore.formMeta) {
        form = generateFormMetaAttributes(graph, setGraph, formStore.formMeta);
      }
    }
    setFormStore("formMetaData", form);
    if (!formStore.formMetaData) {
      setFormStore("error", `No ${props.pageVertexName} configured`);
      return;
    }
    if (!formStore.formMeta) {
      const metaVertexResult = untrack(() => createMeta(form, metaTxnId, graph, setGraph));

      if (metaVertexResult.error) {
        return { error: "Meta Vertex Error" };
      }
      setFormStore("formMeta", metaVertexResult.vertex!);
    }

    setFormStore("isPreview", props.pageId === "preview");
  }

  function hasRequiredPermissions() {
    return (
      formStore.formMetaData &&
      (permissions.insert() || permissions.edit() || permissions.view())
    );
  }

  async function loadData() {
    if (!(id() && (isNoPermissionCheck() || hasRequiredPermissions()))) { return; }
    try {
      const { incoming, outgoing } = getEdgesFromRowsAttr(
        formStore.formMetaData!.attributes, false);
      const data = await fetchDataFromMG({ expression: `id:'${id()}'`, incoming, outgoing });
      
      if (!(isValidResponse(data) && data.result) || data.result.length === 0) {
        setFormStore("error", `No ${props.pageVertexName} found`);
        return;
      }
      
      setGraphData(graph, setGraph, data.graph);
      setFormStore({get formData() { return graph.vertexes[data.result[0].id]; }})
    } catch (e: any) {
      setFormStore("error", `Error When Loading Form: ${e.message}`);
    }
  }
  onMount(async () => {
    setFormStore("mounted", true);
    await loadFormDesignerMetaData();
    if (
      formStore.formMeta &&
      !isNoPermissionCheck() &&
      !formStore.formMeta.P.public
    ) {
      setFormStore("error", `${props.pageVertexName} is not authorized`);
      return;
    }
    if (!formStore.formMeta?.P.name) {
      setFormStore("error", "No name for the page");
      return;
    }
    if (!id()) {
      const newVertexObj = newVertex(
        graph.newVertexId,
        [formStore.formMeta.P.name],
        {},
      );
      // TODO: Do Create Transformation for the vertex
      const addNewVertexResult = addNewVertex(
        formStore.txnId,
        newVertexObj,
        graph,
        setGraph,
      );
      if (addNewVertexResult.error) {
        setFormStore("error", "Error when creating new vertex");
        return;
      }
      setFormStore({get formData() { return graph.vertexes[newVertexObj.id]; }})
    }

    if (!id() && formStore.formData?.L[0] === "Form") {
      const layoutId = addFormInitialComponent(
        formStore.formData, graph, formStore.txnId, setGraph);
      if (layoutId === -1) {
        setFormStore("error", "Adding component to layout failed");
        return;
      }
    }
    saveUndoPoint(formStore.txnId, graph);
    setPreventUndoAtOrBeforeIndex(formStore.txnId, graph);
    saveStepIndex(formStore.txnId, "initial", graph);
    props.initializeFormStoreParent?.(pageFormStore);
    await loadData();
  });

  createEffect(
    on(
      () => props.formId ?? "new",
      () => setFormStore("count", formStore.count + 1),
      { defer: true },
    ),
  );

  createEffect(
    on(
      () => props.expression ?? "new",
      () => {
        setFormStore("formMeta", undefined);
        setFormStore("formData", undefined);
        loadFormDesignerMetaData();
      },
      { defer: true },
    ),
  );
  onCleanup(() => {
    revertTransaction(metaTxnId, graph);
  });
  onCleanup(() => {
    // TODO: Remove all the meta
  });
  onCleanup(() => {
    // @ts-expect-error ignore
    // setLayoutStore?.("formData", undefined);
    for (const rowMetaTxnId of (pageFormStore[0].cleanUpConfig().rowMetaTxnIds || []).reverse()) {
      revertTransaction(rowMetaTxnId, graph);
    }
  });

  useBeforeLeave((e: BeforeLeaveEventArgs) => {
    if (isDisabledTxn(formStore.txnId, graph)) {
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

  const Content = () => (
    <PageView
      data={formStore.formData}
      hasDeletePermission={permissions.delete()}
      hasEditPermission={permissions.edit()}
      hasInsertPermission={permissions.insert()}
      hasViewPermission={permissions.view()}
      id={id()}
      isDesignMode={true}
      isNoPermissionCheck={isNoPermissionCheck()}
      metaVertex={formStore.formMeta}
    />
  );

  return (
    <Show keyed when={formStore.count}>
      <Show when={props.enableSEO}>
        <Show when={formStore.formMeta?.P.seoTitle}>
          <Title>{getPageTitle(formStore.formMeta)}</Title>
        </Show>
        <Show when={formStore.formMeta?.P.seoDescription}>
          <Meta
            content={formStore.formMeta?.P.seoDescription}
            name="description"
          />
        </Show>
      </Show>

      <Switch>
        <Match when={formStore.error}>
          <SimpleWarningAlert message={formStore.error} />
        </Match>
        <Match when={formStore.formMetaData && authError()}>
          <SimpleWarningAlert message={authError()} />
        </Match>
      </Switch>

      {/* <Show when={graph.isDevelopment}>
        <DebugPermissionInfo
          allConfiguredPermission={allConfiguredPermission()}
          authError={authError()}
          hasDeletePermission={hasDeletePermission() ?? false}
          hasEditPermission={hasEditPermission() ?? false}
          hasInsertPermission={hasInsertPermission() ?? false}
          hasViewPermission={hasViewPermission() ?? false}
          isNoPermissionCheck={isNoPermissionCheck()}
          metaVertexId={formStore.formMeta?.id}
          mounted={formStore.mounted}
          userRoles={graph.userRoles}
        />
      </Show> */}
      <Show when={formStore.formData}>
        <FormContext.Provider value={pageFormStore}>
          <Show
            when={
              !authError() &&
              formStore.mounted &&
              formStore.formMeta &&
              (props.dataId && props.dataId !== "new"
                ? formStore.formData
                : true)
            }
          >
            <Show
              fallback={
                <PreviewPage>
                  <Content />
                </PreviewPage>
              }
              when={!formStore.isPreview}
            >
              <Content />
            </Show>
            <Show when={isNoPermissionCheck()}>
              <SaveCancelButton
                closePopUp={props.closePopUp}
                disabled={isDisabledTxn(formStore.txnId, graph)}
              />
            </Show>
          </Show>
        </FormContext.Provider>
      </Show>
      <Show when={formStore.discardPopup}>
        <DialogWithButtons
          message="Discard unsaved changes - are you sure?"
          onCancel={() => setFormStore("discardPopup", false)}
          onConfirm={() => {
            revertTransaction(formStore.txnId, graph);
            setFormStore("discardPopup", false);
            onConfirmExit();
          }}
          open={() => formStore.discardPopup}
          setOpen={setFormStore.bind(null, "discardPopup")}
          title="Discard changes"
        />
      </Show>
    </Show>
  );
}
