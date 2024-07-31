import { Meta, Title } from "@solidjs/meta";
import { clientOnly } from "@solidjs/start";
import { Match, Show, Switch, createEffect, createMemo, createSignal, on, onMount } from "solid-js";

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import PreviewPage from "~/components/PreviewPage";
import { SimpleWarningAlert } from "~/components/SimpleWarningAlert";
import { getConfiguredPermissions, hasPermissions } from "~/components/grid/permissions";
import { generateFormMetaAttributes } from "~/components/page_designer/functions/getChildrenAttrs";
import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { isObject } from "~/lib/data_structure/object/isObject";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { type Id, type Vertex, useGraph } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { FormMetaDataAuth } from "~/lib/meta/formMetaDataAuth";

import { DebugPermissionInfo } from "./DebugPermissionInfo";
const PageView = clientOnly(
  () => import("~/components/page_attr_render/PageView"),
);

export function PageViewWrapper(
  props: Readonly<{
    dataId?: Id
    expression?: string;
    formId?: string;
    pageId?: string;
    pageVertexLabel?: string;
    pageVertexName?: string;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const txnId = graph.newTxnId;

  const [dataVertex, setDataVertex] = createSignal<Vertex>();
  const [metaVertex, setMetaVertex] = createSignal<Vertex>();
  const [mounted, setMounted] = createSignal(false);
  const [isPreview, setIsPreview] = createSignal(false);
  const [error, setError] = createSignal<string>();
  const [formMetaData, setFormMetaData] = createSignal<IFormMetaData | null>(null);

  const id = createMemo(() => (props.dataId === "new" ? undefined : props.dataId));
  const allConfiguredPermission = createMemo(() => getConfiguredPermissions(graph.userRoles, metaVertex(), graph, setGraph));
  const hasInsertPermission = createMemo(() => formMetaData() && !id() && hasPermissions(allConfiguredPermission(), 'insert', graph, setGraph));
  const hasEditPermission = createMemo(() => formMetaData() && !!id() && hasPermissions(allConfiguredPermission(), 'edit', graph, setGraph));
  const hasViewPermission = createMemo(() => formMetaData() && hasPermissions(allConfiguredPermission(), 'view', graph, setGraph));
  const hasDeletePermission = createMemo(() => formMetaData() && hasPermissions(allConfiguredPermission(), 'delete', graph, setGraph));

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
        setMetaVertex(metaVertex_);
      }
    } else if (isObject(data.result)) {
      const metaVertex_ = graph.vertexes[data.result.id];
      setMetaVertex(metaVertex_);
    }
  };

  // load form meta data
  async function loadFormDesignerMetaData() {
    let form = props.pageVertexLabel ? FormMetaData[props.pageVertexLabel] || FormMetaDataAuth[props.pageVertexLabel] : null;
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
        setError(`No ${props.pageVertexName} configured`);
        return;
      }
      metaDtaInitialize(data);
      if (metaVertex()) {
        form = generateFormMetaAttributes(
          graph,
          setGraph,
          metaVertex()!
        )
      }
    }
    setFormMetaData(form);
    if (!formMetaData()) {
      setError(`No ${props.pageVertexName} configured`);
      return;
    }

    setIsPreview(props.pageId === "preview");
  }
  async function loadData() {
    if (!id()) {
      return;
    }
    if (!formMetaData() || (!hasInsertPermission() && !hasEditPermission() && !hasViewPermission())) {
      return;
    }
    try {
      const { incoming, outgoing } = getEdgesFromRowsAttr(
        formMetaData()!.attributes,
        false,
      );

      const data = await fetchDataFromMG({
        expression: `id:'${id()}'`,
        incoming,
        outgoing,
      });
      if (!isValidResponse(data) || !data.result || data.result.length === 0) {
        setError(`No ${props.pageVertexName} found`);
        return;
      }
      setGraphData(graph, setGraph, data.graph);
      setDataVertex(data.result[0]);
    } catch (e: any) {
      console.error("error", e);
      setError(`Error When Loading Form: ${e.message}`);
    }
  }
  onMount(async () => {
    setMounted(true);
    await loadFormDesignerMetaData();
    if (metaVertex() && !metaVertex()!.P.public) {
      setError(`${props.pageVertexName} is not authorized`);
      return;
    }
    await loadData();
  });
  const [count, setCount] = createSignal(1);

  createEffect(
    on(
      () => props.formId ?? "new",
      (v) => setCount((v) => v + 1),
      { defer: true },
    ),
  );

  createEffect(
    on(
      () => props.expression ?? "new",
      (v) => {
        setMetaVertex(undefined);
        setDataVertex(undefined);
        loadFormDesignerMetaData();
      },
      { defer: true },
    ),
  );

  const cleanUpConfig = {};

  const Content = () => <PageView
    data={dataVertex()}
    hasDeletePermission={hasDeletePermission()}
    hasEditPermission={hasEditPermission()}
    hasInsertPermission={hasInsertPermission()}
    hasViewPermission={hasViewPermission()}
    metaVertex={metaVertex()}
  />

  return (
    <Show keyed when={count()}>
      <Show when={metaVertex()?.P.seoTitle}>
        <Title>{metaVertex()?.P.seoTitle}</Title>
      </Show>
      <Show when={metaVertex()?.P.seoDescription}>
        <Meta content={metaVertex()?.P.seoDescription} name="description" />
      </Show>


      <Switch>
        <Match when={error()}>
          <SimpleWarningAlert message={error()} />
        </Match>
        <Match when={formMetaData() && authError()}>
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
          metaVertexId={metaVertex()?.id}
          mounted={mounted()}
          userRoles={graph.userRoles}
        />
      </Show> */}

      <Show when={!authError() && mounted() && metaVertex() && ((props.dataId && props.dataId !== "new") ? dataVertex() : true)}>
        <Show
          fallback={
            <PreviewPage>
              <Content />
            </PreviewPage>
          }
          when={!isPreview()}
        >
          <Content />
        </Show>
      </Show>
    </Show>
  );
}
