
import { clientOnly } from "@solidjs/start";
import { createSignal, onMount, createEffect, on, Show, useContext } from "solid-js";
import PreviewPage from "~/components/PreviewPage";
import { getDataMGCall } from "~/cypher/get/getDataMGCall";
import { FormMetaData } from "~/lib/formMetaData";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";
import { GraphContext, type Vertex } from "~/lib/graph/graph";
import { getNewTxnId } from "~/lib/graph/transaction";
import { isObject } from "~/lib/utils";
import { setGraphData } from "~/lib/websocket/setGraphData";
const PageView = clientOnly(() => import("~/components/page_attr_render/PageView"));

export function PageViewWrapper(props: {
  pageVertexLabel?: string,
  pageVertexName?: string,
  pageId?: string,
  formId?: string,
  expression?: string,
}) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const txnId = getNewTxnId(graph, setGraph);

  const [dataVertex, setDataVertex] = createSignal<Vertex>();
  const [metaVertex, setMetaVertex] = createSignal<Vertex>();
  const [mounted, setMounted] = createSignal(false);
  const [isPreview, setIsPreview] = createSignal(false);

  // load form meta data
  async function loadFormDesignerMetaData() {
    const form = FormMetaData[props.pageVertexLabel!] || FormMetaData.Form;

    const { incoming, outgoing } =
      getEdgesFromRowsAttr(form.attributes);

    const data = await getDataMGCall({
      expression: props.expression ?? (props.formId ? `id:'${props.formId}'` : `g:'${props.pageVertexLabel}[${props.pageVertexName}]'`),
      incoming,
      outgoing,
    });
    if (!data) return;
    setIsPreview(props.pageId === 'preview');

    // @ts-ignore
    if (data.error) {
      // @ts-ignore
      return { error: data.error };
    }
    if (props.formId) {
      delete data.graph.vertexes[props.formId]
    }
    setGraphData(
      graph,
      setGraph,
      data.graph,
    );

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
    <Show when={count()} keyed>
      <Show when={mounted() && metaVertex()}>
        <Show when={!(isPreview())} fallback={
          <PreviewPage>
            <PageView
              metaVertex={metaVertex()}
              data={dataVertex()}
              isPreview={true}
            />
          </PreviewPage>
        }>
          {/* <Show when={dataVertex()}> */}
          <PageView
            metaVertex={metaVertex()}
            data={dataVertex()}
            isPreview={true}
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