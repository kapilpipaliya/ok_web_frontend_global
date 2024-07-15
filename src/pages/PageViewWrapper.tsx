import { clientOnly } from "@solidjs/start";
import { Show, createEffect, createSignal, on, onMount } from "solid-js";

import PreviewPage from "~/components/PreviewPage";
import { SimpleWarningAlert } from "~/components/SimpleWarningAlert";
import { getDataMGCall } from "~/cypher/get/getDataMGCall";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";
import { type Vertex, useGraph } from "~/lib/graph/graph";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { isObject } from "~/lib/utils";
import { setGraphData } from "~/lib/websocket/setGraphData";
const PageView = clientOnly(
  () => import("~/components/page_attr_render/PageView"),
);

export function PageViewWrapper(
  props: Readonly<{
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

    // @ts-ignore
    if (data.error) {
      // @ts-ignore
      return { error: data.error };
    }
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
  onMount(() => {
    setMounted(true);
    loadFormDesignerMetaData();
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
      <Show when={mounted() && metaVertex()}>
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
          {/* <Show when={dataVertex()}> */}
          <PageView
            data={dataVertex()}
            isPreview={true}
            metaVertex={metaVertex()}
          />
        </Show>
        {/* </Show> */}
        {/* Pass Dummy Values */}
        {/* <FormContext.Provider value={{ formData: dataVertex()!, formMeta: metaVertex()!, txnId, cleanUpConfig: () => cleanUpConfig }}> */}

        {/* </FormContext.Provider> */}
      </Show>
    </Show>
  );
}
