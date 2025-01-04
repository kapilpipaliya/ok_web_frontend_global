import { makeEventListener } from "@solid-primitives/event-listener";
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

import {
  FormContext,
  type FormStore,
  getInitialFormStore,
} from "~/components/form/FormContext";
import { addFormInitialComponent } from "~/components/form/functions/addFormInitialComponent";
import { getFormData } from "~/components/form/functions/getFormData";
import { SaveCancelButton } from "~/components/form/SaveCancelButton";
import {
  getConfiguredPermissions,
  hasPermissions,
} from "~/components/page_attr_render/permissions";
import { usePreviewContext } from "~/components/page_designer/context/PreviewContext";
import { generateFormMetaAttributes } from "~/components/page_designer/functions/generateFormMetaAttributes";
import { getPageTitle } from "~/components/page_designer/layout/getPageTitle";
import { DialogWithButtons } from "~/components/styled/DeleteDialog";
import PreviewPage from "~/components/styled/PreviewPage";
import { SimpleWarningAlert } from "~/components/styled/SimpleWarningAlert";
import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { isObject } from "~/lib/data_structure/object/isObject";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { type Id, useGraph } from "~/lib/graph/graph";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
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
    context?: any;
    dataId?: Id;
    enableSEO?: boolean;
    expression?: string;
    formId?: string;
    hideSaveCancelButton?: boolean;
    initializeFormStoreParent?: (formStore: FormStore) => void;
    isNoPermissionCheck?: boolean;
    pageId?: string;
    pageVertexLabel?: string;
    pageVertexName?: string;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const id = createMemo(() =>
    props.dataId === "new" ? undefined : props.dataId,
  );
  const pageFormStore = createStore({
    ...getInitialFormStore(graph),
    get formId() {
      return props.pageVertexName;
    },
    id,
  });
  const [formStore, setFormStore] = pageFormStore;

  let onConfirmExit: () => void;
  const metaTxnId = graph.newTxnId();

  const [previewStore] = usePreviewContext();

  const isNoPermissionCheck = createMemo(
    () =>
      props.isNoPermissionCheck ||
      // @ts-expect-error ignore
      formStore.formMetaData?.isNoPermissionCheck ||
      previewStore.isNoPermissionCheck,
  );
  const allConfiguredPermission = createMemo(() =>
    getConfiguredPermissions(
      graph.userRoles,
      graph.vertexes[formStore.formMetaId!]!,
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
    if (!formStore.formMetaData) {
      return false;
    }
    return (
      isNoPermissionCheck() ||
      (action === "insert" &&
        !id() &&
        hasPermissions(allConfiguredPermission(), action, graph, setGraph)) ||
      (!!id() &&
        hasPermissions(allConfiguredPermission(), action, graph, setGraph))
    );
  }

  setFormStore({
    get hasDeletePermission() {
      return permissions.delete();
    },
    get hasEditPermission() {
      return permissions.edit();
    },
    get hasInsertPermission() {
      return permissions.insert();
    },
    get hasViewPermission() {
      return permissions.view();
    },
    get isNoPermissionCheck() {
      return isNoPermissionCheck();
    },
  });

  const authError = createMemo(() => {
    if (id() && !(permissions.edit() || permissions.view())) {
      return `You are not authorized to edit or view ${props.pageVertexName}`;
    }
    if (!(id() || permissions.insert())) {
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
        setFormStore("formMetaId",data.result[0].id);
      }
    } else if (isObject(data.result)) {
      setFormStore("formMetaId", data.result.id);
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
        [graph.url]: true,
        incoming,
        outgoing,
      });
      if (!(isValidResponse(data) && data.result) || data.result.length === 0) {
        setFormStore("error", `No ${props.pageVertexName} configured`);
        return;
      }
      metaDtaInitialize(data);
      if (graph.vertexes[formStore.formMetaId!]!) {
        form = generateFormMetaAttributes(graph, setGraph, graph.vertexes[formStore.formMetaId!]!);
      }
    }
    setFormStore("formMetaData", form);
    if (!formStore.formMetaData) {
      setFormStore("error", `No ${props.pageVertexName} configured`);
      return;
    }
    if (!formStore.formMetaId) {
      const metaVertexResult = untrack(() => {
        let formToUse = form;
        if (form.key === "Page") {
          formToUse = {
            ...form,
            attributes: form.attributes.map(attr => ({
              ...attr,
              attributes: attr.attributes?.filter(a => a.key !== "Attr")
            }))
          };
        }
        return createMeta(formToUse, metaTxnId, graph, setGraph);
      });

      if (metaVertexResult.error) {
        return { error: "Meta Vertex Error" };
      }
      setFormStore("formMetaId", metaVertexResult.vertex!.id);
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
    if (!(id() && (isNoPermissionCheck() || hasRequiredPermissions()))) {
      return;
    }
    try {
      const { data, error } = await getFormData(
        graph,
        formStore.formMetaData!.attributes,
        id()!
      );

      if (error || !Array.isArray(data?.result) || data.result.length === 0) {
        setFormStore("error", `No ${props.pageVertexName} found`);
        return;
      }

      setGraphData(graph, setGraph, data!.graph!);
      setFormStore({
        get formDataId() {
          return data!.result[0].id;
        },
      });
    } catch (e: any) {
      setFormStore("error", `Error When Loading Form: ${e.message}`);
    }
  }
  onMount(async () => {
    setFormStore("mounted", true);
    await loadFormDesignerMetaData();
    if (
      formStore.formMetaId &&
      !isNoPermissionCheck() &&
      !graph.vertexes[formStore.formMetaId!]!.P.public
    ) {
      setFormStore(
        "error",
        `${props.pageVertexName} ${props.pageVertexLabel} is not authorized`,
      );
      return;
    }
    if (!graph.vertexes[formStore.formMetaId!]?.P.key) {
      setFormStore("error", "No key for the page");
      return;
    }
    if (!id()) {
      const createResult = createFormVertex(
        graph,
        setGraph,
        formStore.txnId,
        graph.vertexes[formStore.formMetaId!]!.P.key,
        {},
      );
      if (createResult.error) {
        setFormStore("error", createResult.error);
        return;
      }
      setFormStore({
        get formDataId() {
          return createResult.vertex!.id;
        },
      });
    }

    if (!id() && graph.vertexes[formStore.formDataId!]?.L[0] === "Form") {
      const layoutId = addFormInitialComponent(
        graph.vertexes[formStore.formDataId!],
        graph,
        formStore.txnId,
        setGraph,
      );
      if (layoutId === -1) {
        setFormStore("error", "Adding component to layout failed");
        return;
      }
    }
    saveUndoPoint(formStore.txnId, graph, setGraph);
    setPreventUndoAtOrBeforeIndex(formStore.txnId, graph, setGraph);
    saveStepIndex(formStore.txnId, "initial", graph, setGraph);
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
        setFormStore("formMetaId", undefined);
        setFormStore("formDataId", undefined);
        loadFormDesignerMetaData();
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
  onCleanup(() => {
    // @ts-expect-error ignore
    // setLayoutStore?.("formData", undefined);
    for (const rowMetaTxnId of (
      pageFormStore[0].cleanUpConfig().rowMetaTxnIds || []
    ).reverse()) {
      revertTransaction(rowMetaTxnId, graph, setGraph);
    }
    pageFormStore[0].cleanUpConfig().rowMetaTxnIds = [];
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
  
  const beforeunload = (event: BeforeUnloadEvent) => {
    if (!isDisabledTxn(formStore.txnId, graph)) {
      event.preventDefault();
      event.returnValue = ""; // Chrome requires returnValue to be set
    }
  };
  makeEventListener(window, "beforeunload", beforeunload);

  const Content = () => (
    <PageView
      context={props.context}
      data={graph.vertexes[formStore.formDataId!]}
      hasDeletePermission={permissions.delete()}
      hasEditPermission={permissions.edit()}
      hasInsertPermission={permissions.insert()}
      hasViewPermission={permissions.view()}
      id={id()}
      isNoPermissionCheck={isNoPermissionCheck()}
      metaVertex={graph.vertexes[formStore.formMetaId!]!}
    />
  );

  return (
    <Show keyed when={formStore.count}>
      <Show when={props.enableSEO}>
        <Show when={graph.vertexes[formStore.formMetaId!]?.P.seoTitle}>
          <Title>{getPageTitle(graph.vertexes[formStore.formMetaId!]!)}</Title>
        </Show>
        <Show when={graph.vertexes[formStore.formMetaId!]?.P.seoDescription}>
          <Meta
            content={graph.vertexes[formStore.formMetaId!]!.P.seoDescription}
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
      <Show when={graph.vertexes[formStore.formDataId!]}>
        <FormContext.Provider value={pageFormStore}>
          <Show
            when={
              !authError() &&
              formStore.mounted &&
              graph.vertexes[formStore.formMetaId!]! &&
              (props.dataId && props.dataId !== "new"
                ? graph.vertexes[formStore.formDataId!]
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
            <Show when={isNoPermissionCheck() && !props.hideSaveCancelButton}>
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
            revertTransaction(formStore.txnId, graph, setGraph);
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
