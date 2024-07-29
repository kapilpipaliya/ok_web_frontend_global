import { Meta, Title } from "@solidjs/meta";
import { clientOnly } from "@solidjs/start";
import { Show, createEffect, createMemo, createSignal, on, onMount } from "solid-js";

import type { ServerResult } from "~/cypher/types/ServerResult";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import PreviewPage from "~/components/PreviewPage";
import { SimpleWarningAlert } from "~/components/SimpleWarningAlert";
import { getConfiguredPermissions } from "~/components/grid/permissions";
import { generateFormMetaAttributes } from "~/components/page_designer/functions/getChildrenAttrs";
import { fetchDataFromMG } from "~/cypher/get/fetchDataFromMG";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { isObject } from "~/lib/data_structure/object/isObject";
import { getEdgesFromRowsAttr } from "~/lib/graph/get/sync/getEdgesFromRowsAttr";
import { type Id, type Vertex, useGraph } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { FormMetaDataAuth } from "~/lib/meta/formMetaDataAuth";
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
  const allConfiguredPermission = createMemo(() => getConfiguredPermissions(graph.userRoles, metaVertex()?.id, graph, setGraph));

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
    let form = props.pageVertexLabel ? FormMetaData[props.pageVertexLabel!] || FormMetaDataAuth[props.pageVertexLabel!] : null;
    if (!form) {
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
      if (!data || !isValidResponse(data) || data.error || data.result.length === 0) {
        setError(`No ${props.pageVertexLabel} configured`);
        return;
      }      
      metaDtaInitialize(data);
    }
    form =  metaVertex() ? generateFormMetaAttributes(
      graph,
      setGraph,
      metaVertex()!
    ) : (FormMetaData[props.pageVertexLabel!] || FormMetaDataAuth[props.pageVertexLabel!]);
    setFormMetaData(form);
    setIsPreview(props.pageId === "preview");
  }
  async function loadData() {
    if (!props.dataId || props.dataId === "new") {
      return;
    }
    try {
      const { incoming, outgoing } = getEdgesFromRowsAttr(
        formMetaData()!.attributes,
        false,
      );

      const data = await fetchDataFromMG({
        expression: `id:'${props.dataId}'`,
        incoming,
        outgoing,
      });
      if (!data || !isValidResponse(data) || data.error || data.result.length === 0) {
        setError(`No ${props.pageVertexLabel} found`);
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
      setError(`${props.pageVertexLabel} is not authorized`);
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

  return (
    <Show keyed when={count()}>
      <Show when={error()}>
        <SimpleWarningAlert message={error()} />
      </Show>
      <Show when={metaVertex()?.P.seoTitle}>
        <Title>{metaVertex()?.P.seoTitle}</Title>
      </Show>
      <Show when={metaVertex()?.P.seoDescription}>
        <Meta content={metaVertex()?.P.seoDescription} name="description" />
      </Show>
      <Show when={mounted() && metaVertex() && ((props.dataId && props.dataId !== "new") ? dataVertex() : true)}>
        <Show
          fallback={
            <PreviewPage>
              <PageView
                data={dataVertex()}
                isPreview={true}
                metaVertex={metaVertex()}
              />
            </PreviewPage>
          }
          when={!isPreview()}
        >
          <PageView
            data={dataVertex()}
            isPreview={true}
            metaVertex={metaVertex()}
          />
        </Show>
      </Show>
    </Show>
  );
}
