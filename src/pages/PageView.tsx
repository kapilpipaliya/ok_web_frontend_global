import { graph } from "neo4j-driver";
import { createSignal, onMount, createEffect, on, Show, useContext } from "solid-js";
import { PageView } from "~/components/page_attr_render/PageView";
import { getDataMGCall } from "~/cypher/get/getDataMGCall";
import { IsPreviewContext, FormContext } from "~/lib/contexts";
import { FormMetaData } from "~/lib/formMetaData";
import { getEdgesFromRowsAttr } from "~/lib/getEdgesFromRowsAttr";
import { GraphContext, GraphInterface, Vertex } from "~/lib/graph/graph";
import { getNewTxnId } from "~/lib/graph/transaction";
import { setGraphData } from "~/lib/websocket/ws_events";

export function PageViewBase(props: {
    pageVertexLabel?: string,
    pageVertexName?: string,
    pageId?: string,
    formId?: string,
}) {
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
        expression: props.formId ? `id:'${props.formId}'` : `g:'${props.pageVertexLabel}[${props.pageVertexName}]'`,
        incoming,
        outgoing,
      });
  
      // @ts-ignore
      if (data.error) {
        // @ts-ignore
        return { error: data.error };
      } 
      delete data.graph.vertexes[props.formId!]
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
      
      console.log('On Mout');
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