import { useParams } from "@solidjs/router";
import { Show, createSignal, onMount, useContext, createEffect, on } from "solid-js";
import { getDataMGCall } from "~/cypher/get/traverse";
import { FormMetaData } from "~/lib/formMetaData";
import { FormContext, IsPreviewContext } from "~/lib/contexts";
import { GraphContext, type Vertex } from "~/lib/graph/graph";
import { getNewTxnId } from "~/lib/graph/transaction";
import { setGraphData } from "~/lib/websocket/ws_events";
import { PageView } from "~/components/page_item_render/PageView";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";


export default function PageShareView() {
  const params = useParams();
  const label = params["entity"];
  const entityname = params["entityname"];
  const formId = params["formId"];
  const [graph, setGraph] = useContext(GraphContext)!;
  const txnId = getNewTxnId(graph, setGraph);

  const [dataVertex, setDataVertex] = createSignal<Vertex>();
  const [metaVertex, setMetaVertex] = createSignal<Vertex>();
  const [mounted, setMounted] = createSignal(false);


  // load form meta data
  async function loadFormDesignerMetaData() {
    const form = FormMetaData.Form;

    const { incoming, outgoing }: { incoming: any; outgoing: any } =
      getEdgesFromRowsAttr(form.attributes);

    const data = await getDataMGCall({
      expression: `g:'${label}[${entityname}]'`,
      incoming,
      outgoing,
    });

    // @ts-ignore
    if (data.error) {
      // @ts-ignore
      return { error: data.error };
    }
    setGraphData(
      graph,
      setGraph,
      data.graph,
    );

    const metaVertex = graph.vertexes[data.result[0].id];
    setMetaVertex(metaVertex);

  }
  onMount(() => {
    setMounted(true);
    loadFormDesignerMetaData();
  });
  const [count, setCount] = createSignal(1);

  createEffect(
    on(
      () => params.formId,
      (v) => setCount((v) => v + 1),
      { defer: true },
    ),
  );

  const cleanUpConfig = {};

  return (
    <Show when={count()} keyed>
      <Show when={mounted() && metaVertex()}>
        <IsPreviewContext.Provider value={createSignal(true)}>
          {/* Pass Dummy Values */}
          <FormContext.Provider value={{ formData: dataVertex()!, formMeta: metaVertex()!, txnId, cleanUpConfig: () => cleanUpConfig }}>
            <PageView
              metaVertex={metaVertex()}
            />
          </FormContext.Provider>
        </IsPreviewContext.Provider>
      </Show>
    </Show>
  );
}
