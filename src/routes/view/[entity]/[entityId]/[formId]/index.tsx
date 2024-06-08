import { useParams } from "@solidjs/router";
import { Show, createSignal, onMount, useContext } from "solid-js";
import { PageView } from "~/components/dynamic/fields/static/GenaricField";
import { getDataMGCall } from "~/cypher_api/lib/graph/get/async/traverse";
import { FormContext, getEdgesFromRowsAttr } from "~/lib/Utils";
import { AttrsTableData } from "~/lib/api";
import { IsPreviewContext } from "~/lib/contexts";
import { GraphContext, Vertex } from "~/lib/graph/graph";
import { getNewTxnId } from "~/lib/graph/transaction";
import { setGraphData } from "~/lib/websocket/ws_events";


export default function PageShareView() {
  const params = useParams();
  const label = params["entity"];
  const entityId = params["entityId"];
  const formId = params["formId"];
  const [graph, setGraph] = useContext(GraphContext)!;
  const txnId = getNewTxnId(graph, setGraph);

  const [dataVertex, setDataVertex] = createSignal<Vertex>();
  const [metaVertex, setMetaVertex] = createSignal<Vertex>();
  const [mounted, setMounted] = createSignal(false);

  // load form meta data
  async function loadFormDesignerMetaData() {
    let form = AttrsTableData.Form;

    const { incoming, outgoing }: { incoming: any; outgoing: any } =
      getEdgesFromRowsAttr(form.attributes);

    const result = await getDataMGCall({
      expression: `id:'${entityId}'`,
      incoming,
      outgoing,
    });

    // @ts-ignore
    if (result.error) {
      // @ts-ignore
      return { error: result.error };
    }
    setGraphData(
      graph,
      setGraph,
      result.graph,
    );
    setMetaVertex(graph.vertexes[entityId]);
  }
  onMount(() => {
    setMounted(true);
    loadFormDesignerMetaData();
  })

  const cleanUpConfig = {};

  return (
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
  );
}
