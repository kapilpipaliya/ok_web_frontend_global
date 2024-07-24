import { Meta, Title } from "@solidjs/meta";
import { clientOnly } from "@solidjs/start";
import { Match, Show, Switch, createEffect, createSignal, on, onMount } from "solid-js";

import PreviewPage from "~/components/PreviewPage";
import { SimpleWarningAlert } from "~/components/SimpleWarningAlert";
import { getFormAttr } from "~/components/grid/getFormAttr";
import { getDataMGCall } from "~/cypher/get/getDataMGCall";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";
import { Id, type Vertex, useGraph } from "~/lib/graph/graph";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { isObject } from "~/lib/utils";
import { setGraphData } from "~/lib/websocket/setGraphData";
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

  // load form meta data
  async function loadFormDesignerMetaData() {
    const form = FormMetaData[props.pageVertexLabel!] || FormMetaData.Form;

    const { incoming, outgoing } = getEdgesFromRowsAttr(form.attributes);

    const data = await getDataMGCall({
      expression:
        props.expression ??
        (props.formId
          ? `id:'${props.formId}'`
          : `g:'${props.pageVertexLabel}[${props.pageVertexName}]'`),
      incoming,
      outgoing,
    });
    if (!data || !isValidResponse(data) || data.error || data.result.length === 0) {
      setError(`No ${props.pageVertexLabel} found`);
      return;
    }
    if (!data.result[0].P.public) {
      setError(`${props.pageVertexLabel} is not authorized`);
      return;
    }
    setIsPreview(props.pageId === "preview");

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
  }
  async function loadData() {
    if (!props.dataId) {
      return;
    }
    try {
      const formAttrResult = await getFormAttr(props.pageVertexName ?? "");
      if (formAttrResult.error) {
        setError(formAttrResult.error);
        return;
      }

      const { incoming, outgoing } = getEdgesFromRowsAttr(
        formAttrResult.form!.attributes,
        false,
      );

      const data = await getDataMGCall({
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
  onMount(() => {
    setMounted(true);
    loadFormDesignerMetaData();
    loadData();
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
      <Show when={mounted() && metaVertex() && (props.dataId ? dataVertex() : true)}>
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
