import { Meta, Title } from "@solidjs/meta";
import { type BeforeLeaveEventArgs, useBeforeLeave } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { Match, Show, Switch, createEffect, createMemo, on, onCleanup, onMount, untrack } from "solid-js";
import { createStore } from "solid-js/store";

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { DialogWithButtons } from "~/components/DeleteDialog";
import PreviewPage from "~/components/PreviewPage";
import { SimpleWarningAlert } from "~/components/SimpleWarningAlert";
import { FormContext } from "~/components/form/FormContext";
import { SaveCancelButton } from "~/components/form/SaveCancelButton";
import { addFormInitialComponent } from "~/components/form/functions/addFormInitialComponent";
import { InitialPermissions } from "~/components/page_attr_render/InitialPermissions";
import { getConfiguredPermissions, hasPermissions } from "~/components/page_attr_render/permissions";
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";
import { generateFormMetaAttributes } from "~/components/page_designer/functions/getChildrenAttrs";
import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { isObject } from "~/lib/data_structure/object/isObject";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { type GraphInterface, type Id, type Vertex, useGraph } from "~/lib/graph/graph";
import { createMeta } from "~/lib/graph/mutate/form/metaFunction";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { isDisabledTxn } from "~/lib/graph/transaction/isDisabledTxn";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { saveStepIndex } from "~/lib/graph/transaction/saveStepIndex";
import { saveUndoPoint } from "~/lib/graph/transaction/saveUndoPoint";
import { setPreventUndoAtOrBeforeIndex } from "~/lib/graph/transaction/setPreventUndoAtOrBeforeIndex";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { DebugPermissionInfo } from "./DebugPermissionInfo";
const PageView = clientOnly(
  () => import("~/components/page_attr_render/PageView"),
);

const getInitialFormStore = (graph: GraphInterface) => ({
  ...InitialPermissions,
  count: 1,
  discardPopup: false,
  error: undefined as string | undefined,
  formData: undefined as Vertex | undefined,
  formId: undefined as string | undefined,
  formMeta: undefined as Vertex | undefined,
  formMetaData: null as IFormMetaData | null,
  isPreview: false,
  mounted: false,
  txnId: graph.newTxnId,
});

export function PageViewWrapper(
  props: Readonly<{
    closePopUp?: () => void;
    dataId?: Id
    expression?: string;
    formId?: string;
    pageId?: string;
    pageVertexLabel?: string;
    pageVertexName?: string;
  }>,
) {
  const [graph, setGraph] = useGraph();

  const [formStore, setFormStore] = createStore(getInitialFormStore(graph));
  setFormStore({
    get formId() {
      return props.pageVertexName;
    }
  });
  const [, setLayoutStore] = useDesignerLayoutStore() || [];
  let onConfirmExit: () => void;

  const id = createMemo(() => (props.dataId === "new" ? undefined : props.dataId));
  const isNoPermissionCheck = createMemo(() => formStore.formMetaData?.isNoPermissionCheck);
  const allConfiguredPermission = createMemo(() => getConfiguredPermissions(graph.userRoles, formStore.formMeta, graph, setGraph));
  const hasInsertPermission = createMemo(() => formStore.formMetaData && (isNoPermissionCheck() || (!id() && hasPermissions(allConfiguredPermission(), 'insert', graph, setGraph))));
  const hasEditPermission = createMemo(() => formStore.formMetaData && (isNoPermissionCheck() || (!!id() && hasPermissions(allConfiguredPermission(), 'edit', graph, setGraph))));
  const hasViewPermission = createMemo(() => formStore.formMetaData && (isNoPermissionCheck() || hasPermissions(allConfiguredPermission(), 'view', graph, setGraph)));
  const hasDeletePermission = createMemo(() => formStore.formMetaData && (isNoPermissionCheck() || hasPermissions(allConfiguredPermission(), 'delete', graph, setGraph)));

  setFormStore({
    get hasDeletePermission() { return hasDeletePermission(); },
    get hasEditPermission() { return hasEditPermission(); },
    get hasInsertPermission() { return hasInsertPermission(); },
    get hasViewPermission() { return hasViewPermission(); },
    get isNoPermissionCheck() { return isNoPermissionCheck(); },
  });

  const authError = createMemo(() => {
    if (!id()) {
      if (!hasInsertPermission()) {
        return `You are not authorized to insert ${props.pageVertexName}`;
      }
    } else {
      if (!hasEditPermission() && !hasViewPermission()) {
        return `You are not authorized to edit or view ${props.pageVertexName}`;
      }
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
    let form = props.pageVertexLabel ? FormMetaData[props.pageVertexLabel] : null;
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
      if (!isValidResponse(data) || !data.result || data.result.length === 0) {
        setFormStore("error", `No ${props.pageVertexName} configured`);
        return;
      }
      metaDtaInitialize(data);
      if (formStore.formMeta) {
        form = generateFormMetaAttributes(
          graph,
          setGraph,
          formStore.formMeta
        )
      }
    }
    setFormStore("formMetaData", form);
    if (!formStore.formMetaData) {
      setFormStore("error", `No ${props.pageVertexName} configured`);
      return;
    }
    if (!formStore.formMeta) {
      const metaVertexResult = untrack(() => createMeta(form, graph, setGraph));

      if (metaVertexResult.error) {
        return { error: "Meta Vertex Error" };
      }
      setFormStore("formMeta", metaVertexResult.vertex!);
    }

    setFormStore("isPreview", props.pageId === "preview");
  }
  async function loadData() {
    if (!id()) {
      return;
    }
    if (!formStore.formMetaData || (!hasInsertPermission() && !hasEditPermission() && !hasViewPermission())) {
      return;
    }
    try {
      const { incoming, outgoing } = getEdgesFromRowsAttr(
        formStore.formMetaData.attributes,
        false,
      );

      const data = await fetchDataFromMG({
        expression: `id:'${id()}'`,
        incoming,
        outgoing,
      });
      if (!isValidResponse(data) || !data.result || data.result.length === 0) {
        setFormStore("error", `No ${props.pageVertexName} found`);
        return;
      }
      setGraphData(graph, setGraph, data.graph);
      setFormStore("formData", data.result[0]);
    } catch (e: any) {
      console.error("error", e);
      setFormStore("error", `Error When Loading Form: ${e.message}`);
    }
  }
  onMount(async () => {
    setFormStore("mounted", true);
    await loadFormDesignerMetaData();
    if (formStore.formMeta && !isNoPermissionCheck() && !formStore.formMeta.P.public) {
      setFormStore("error", `${props.pageVertexName} is not authorized`);
      return;
    }
    if (!props.pageVertexName) {
      return;
    }
    if (!id()) {
      const newVertexObj = newVertex(graph.newVertexId, [props.pageVertexName], {});
      // TODO: Do Create Transformation for the vertex
      const addNewVertexResult = addNewVertex(formStore.txnId, newVertexObj, graph, setGraph);
      if (addNewVertexResult.error) {
        setFormStore("error", addNewVertexResult.error && "Error when creating new vertex");
        return;
      }
      setFormStore("formData", graph.vertexes[newVertexObj.id]);
    }
    if (!id() && formStore.formData?.L[0] === "Form") {
      const layoutId = addFormInitialComponent(formStore.formData, graph, formStore.txnId, setGraph);
      if (layoutId === -1) {
        setFormStore("error", "Adding component to layout failed");
        return;
      }
    }
    saveUndoPoint(formStore.txnId, graph);
    setPreventUndoAtOrBeforeIndex(formStore.txnId, graph);
    saveStepIndex(formStore.txnId, "initial", graph);
    setLayoutStore?.("formData", formStore);
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

  const cleanUpConfig = {};
  onCleanup(() => {
    // @ts-expect-error ignore
    // setLayoutStore?.("formData", undefined);

    for (const rowMetaTxnId of cleanUpConfig.rowMetaTxnIds || [])
      revertTransaction(rowMetaTxnId, graph);
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

  const Content = () => <PageView
    data={formStore.formData}
    hasDeletePermission={hasDeletePermission()}
    hasEditPermission={hasEditPermission()}
    hasInsertPermission={hasInsertPermission()}
    hasViewPermission={hasViewPermission()}
    id={id()}
    metaVertex={formStore.formMeta}
  />

  return (
    <Show keyed when={formStore.count}>
      <Show when={formStore.formMeta?.P.seoTitle}>
        <Title>{formStore.formMeta?.P.seoTitle}</Title>
      </Show>
      <Show when={formStore.formMeta?.P.seoDescription}>
        <Meta content={formStore.formMeta?.P.seoDescription} name="description" />
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
        <FormContext.Provider value={formStore}>
          <Show when={!authError() && formStore.mounted && formStore.formMeta && ((props.dataId && props.dataId !== "new") ? formStore.formData : true)}>
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
