import {makeEventListener} from "@solid-primitives/event-listener";
import {Meta, Title} from "@solidjs/meta";
import {type BeforeLeaveEventArgs, useBeforeLeave} from "@solidjs/router";
import {createEffect, createMemo, Match, on, onCleanup, onMount, Show, Switch, untrack,} from "solid-js";
import {v7 as uuidv7} from "uuid";

import type {ServerResult} from "~/cypher/types/ServerResult";
import type {IFormMetaData} from "~/lib/meta/FormMetadataType";

import {FormContext, type FormStoreObject, getInitialFormStore} from "~/components/form/context/FormContext";
import {addFormInitialComponent} from "~/components/form/functions/addFormInitialComponent";
import {getFormData} from "~/components/form/functions/getFormData";
import {SaveCancelButton} from "~/components/form/SaveCancelButton";
import { PageView } from "~/components/page_attr_render/PageView";
import {getConfiguredPermissions, hasPermissions,} from "~/components/page_attr_render/permissions";
import {usePreviewContext} from "~/components/page_designer/context/PreviewContext";
import {generateFormMetaAttributes} from "~/components/page_designer/functions/generateFormMetaAttributes";
import {PageDesignerLabels} from "~/components/page_designer/functions/PageDesignerLabels";
import {getPageTitle} from "~/components/page_designer/layout/getPageTitle";
import {DialogWithButtons} from "~/components/styled/DeleteDialog";
import {PreviewPage} from "~/components/styled/PreviewPage";
import {SimpleWarningAlert} from "~/components/styled/SimpleWarningAlert";
import {fetchComponentData} from "~/cypher/get/fetchComponentData";
import {fetchDataFromMG} from "~/cypher/get/fetchDataFromMG";
import {isValidResponse} from "~/lib/api/isValidResponse";
import {isObject} from "~/lib/data_structure/object/isObject";
import {getEdgesFromRowsAttr} from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import {getGlobalStore} from "~/lib/graph/get/sync/getGlobalStore";
import {type Id, useGraph, type Vertex} from "~/lib/graph/graph";
import { createCompContextVertex } from "~/lib/graph/mutate/createCompContextVertex";
import {createViewVertex} from "~/lib/graph/mutate/createViewVertex";
import {createFormVertex} from "~/lib/graph/mutate/form/createForm";
import {createMeta} from "~/lib/graph/mutate/form/createMeta";
import {setGraphData} from "~/lib/graph/mutate/setGraphData";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import {addNewVertex, deleteVertex, mergeVertexProperties, newVertex} from "~/lib/graph/mutate/vertex";
import {generateNewTxnId} from "~/lib/graph/transaction/generateNewTxnId";
import {isDisabledTxn} from "~/lib/graph/transaction/isDisabledTxn";
import {revertTransaction} from "~/lib/graph/transaction/revertTransaction";
import {saveStepIndex} from "~/lib/graph/transaction/saveStepIndex";
import {saveUndoPoint} from "~/lib/graph/transaction/saveUndoPoint";
import {setPreventUndoAtOrBeforeIndex} from "~/lib/graph/transaction/setPreventUndoAtOrBeforeIndex";
import { parentComponentAttribute, parentTemplateAttribute } from "~/lib/meta/base/Comp";
import {FormMetaData} from "~/lib/meta/formMetaData";

export function PageViewWrapper(
  props: Readonly<{
    closePopUp?: () => void;
    context?: any;
    dataId?: Id;
    enableSEO?: boolean;
    expression?: string;
    formDataId?: Id;
    formId?: string;
    hideSaveCancelButton?: boolean;
    initializeFormStoreParent?: (formStoreId: Id) => void;
    isNoPermissionCheck?: boolean;
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
  const viewVertexObject = createViewVertex({view: "Desktop"}, graph, setGraph);
  const componentVertexObject = createCompContextVertex({}, graph, setGraph);
  const initialFormStore = getInitialFormStore(graph, setGraph);
  const pageFormVertexObject = newVertex(layoutStoreId, ["PageForm"], {
    ...initialFormStore,
    componentValue: componentVertexObject.id,
    formId: props.pageVertexName,
    id: id()!,
    openedViews: [viewVertexObject.id],
    txnId: props.txnId ?? initialFormStore.txnId
  });

  addNewVertex(0, pageFormVertexObject, graph, setGraph);

  const formStore = () => graph.vertexes[pageFormVertexObject.id] as Vertex<FormStoreObject>;
  const setFormStore = (key: string, value: any) => {
    mergeVertexProperties<FormStoreObject>(0, pageFormVertexObject.id, graph, setGraph, { [key]: value });
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
  })

  let onConfirmExit: () => void;
  const metaTxnId = generateNewTxnId(graph, setGraph);

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
    if (!formStore()?.P.formMetaData) {
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

  const metaDtaInitialize = (data: ServerResult) => {
    if (props.formId && graph.vertexes[props.formId]) {
      delete data.graph!.vertexes[props.formId];
    }
    setGraphData(graph, setGraph, data.graph!);

    if (Array.isArray(data.result)) {
      if (data.result.length > 0) {
        setFormStore("formMetaId", data.result[0].id);
      }
    } else if (isObject(data.result)) {
      setFormStore("formMetaId", data.result.id);
    }
  };

  // load form meta data
  async function loadFormDesignerMetaData(): Promise<boolean> {
    if (!formStore()) {
      return false;
    }
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
        [getGlobalStore(graph).P.url]: true,
        incoming,
        outgoing,
      });
      if (!(isValidResponse(data) && data.result) || data.result.length === 0) {
        setFormStore("error", `No ${props.pageVertexName} configured`);
        return false;
      }
      metaDtaInitialize(data);
      if (formStore()?.P.formMetaId && graph.vertexes[formStore().P.formMetaId!]!) {
        form = generateFormMetaAttributes(graph, setGraph, graph.vertexes[formStore().P.formMetaId!]!);
      }
    }
    setFormStore("formMetaData", form);
    if (!formStore()?.P.formMetaData) {
      setFormStore("error", `${props.pageVertexName} is not configured`);
      return false;
    }
    if (!formStore().P.formMetaId) {
      const metaVertexResult = untrack(() => {
        let formToUse = form;
        if (PageDesignerLabels.includes(form.key) || form.key === "Component") {
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
        return false;
      }
      setFormStore("formMetaId", metaVertexResult.vertex!.id);
    }

    setFormStore("isPreview", props.pageId === "preview");
    return true;
  }

  function hasRequiredPermissions() {
    return (
      formStore().P.formMetaData &&
      (permissions.insert() || permissions.edit() || permissions.view())
    );
  }

  async function loadData() {
    if (props.formDataId) {
      setFormStore("formDataId", props.formDataId);
      return;
    }
    if (!(id() && (isNoPermissionCheck() || hasRequiredPermissions()))) {
      return;
    }
    try {
      const { data, error } = await getFormData(
        graph,
        formStore().P.formMetaData!.attributes,
        id()!
      );

      if (error || !Array.isArray(data?.result) || data.result.length === 0) {
        setFormStore("error", `No ${props.pageVertexName} found`);
        return;
      }

      // Find all Component vertices from the loaded data
      const componentVertices = Object.values(data!.graph!.vertexes).filter(v => 
        v.L.includes("Component")
      );

      // Fetch data for all components
      if (componentVertices.length > 0) {        
        await fetchComponentData(componentVertices, graph, setGraph);
      }

      setGraphData(graph, setGraph, data!.graph!);
      setFormStore("formDataId", data!.result[0].id);
    } catch (e: any) {
      setFormStore("error", `Error When Loading Form: ${e.message}`);
    }
  }
  onMount(async () => {
    setFormStore("mounted", true);
    if (!await loadFormDesignerMetaData()) {
      return;
    }
    if (
      formStore().P.formMetaId &&
      !isNoPermissionCheck() &&
      !graph.vertexes[formStore().P.formMetaId!]!.P.public
    ) {
      setFormStore(
        "error",
        `${props.pageVertexName} ${props.pageVertexLabel} is not authorized`,
      );
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
    if (!id()) {
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
      if (props.parentId && (props.pageVertexName === "Template" || props.pageVertexName === "Component")) {
        const parentComponentMetaVertex = {
          id: "",
          IN: {},
          L: [],
          OUT: {},
          P: props.pageVertexName === "Template" ? parentTemplateAttribute : parentComponentAttribute,
        } as Vertex;
        setSelectionValue(
          formStore().P.txnId,
          createResult.vertex!,
          graph,
          setGraph,
          parentComponentMetaVertex,
          props.parentId
        );
      }

      setFormStore("formDataId", createResult.vertex!.id);
    }

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
    saveUndoPoint(formStore().P.txnId, graph, setGraph);
    if (!props.parentId && !props.txnId) {
      setPreventUndoAtOrBeforeIndex(formStore().P.txnId, graph, setGraph);
    }
    saveStepIndex(formStore().P.txnId, "initial", graph, setGraph);
    props.initializeFormStoreParent?.(pageFormVertexObject.id);
    await loadData();
  });

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

  // Each open tab will be hidden and have its own useBeforeLeave callback
  useBeforeLeave((e: BeforeLeaveEventArgs) => {
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
  makeEventListener(window, "beforeunload", beforeunload);

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
      <Show when={props.enableSEO}>
        <Show when={graph.vertexes[formStore().P.formMetaId!]?.P.seoTitle}>
          <Title>{getPageTitle(graph.vertexes[formStore().P.formMetaId!]!)}</Title>
        </Show>
        <Show when={graph.vertexes[formStore().P.formMetaId!]?.P.seoDescription}>
          <Meta
            content={graph.vertexes[formStore().P.formMetaId!]!.P.seoDescription}
            name="description"
          />
        </Show>
      </Show>

      <Switch>
        <Match when={formStore().P.error}>
          <SimpleWarningAlert message={formStore().P.error} />
        </Match>
        <Match when={formStore().P.formMetaData && authError()}>
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
      <Show when={graph.vertexes[formStore().P.formDataId!]}>
        <FormContext.Provider value={formStore().id}>
          <Show
            when={
              !authError() &&
              formStore().P.mounted &&
              graph.vertexes[formStore().P.formMetaId!]! &&
              (props.dataId && props.dataId !== "new"
                ? graph.vertexes[formStore().P.formDataId!]
                : true)
            }
          >
            <Show
              fallback={
                <PreviewPage>
                  <Content />
                </PreviewPage>
              }
              when={!formStore().P.isPreview}
            >
              <Content />
            </Show>
            <Show when={isNoPermissionCheck() && !props.hideSaveCancelButton}>
              <SaveCancelButton
                closePopUp={props.closePopUp}
                disabled={isDisabledTxn(formStore().P.txnId, graph)}
              />
            </Show>
          </Show>
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
