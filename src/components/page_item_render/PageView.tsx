import { GraphContext, Vertex } from "~/lib/graph/graph";
import { createMemo, Match, Show, Switch, useContext } from "solid-js";
import {
 PageItemRender,
 PageRenderUtils
} from "~/components/page_item_render/PageItemRender";
import { PageContext } from "~/lib/contexts";

export function PageView(props: {
 metaVertex?: Vertex;
 data?: Vertex;
 isPreview?: boolean
}) {
 const [graph, setGraph] = useContext(GraphContext)!;
 const collection = createMemo(() =>
  PageRenderUtils.getCollection(graph, props.metaVertex)
 );
 const dataVertex = createMemo(() =>
  PageRenderUtils.getDataVertex(graph, props.metaVertex)
 );

 return (
  <PageContext.Provider value={{ events: {} }}>
   <Show when={props.metaVertex} keyed>
    <Switch>
     {/* <Match when={collection() && !dataVertex()}> */}
     {/* <For
              each={
                getSelectionOptions(
                  graph,
                  setGraph,
                  [props.vertex!],
                  `'g:${collection()!}'`,
                ).vertexes
              }
            >
              {(vertex) => (
                <PageRenderContext.Provider value={[props.vertex!]}>
                  <PageItemRender metaVertex={props.vertex!} data={vertex} />
                </PageRenderContext.Provider>
              )}
            </For> */}
     {/* </Match> */}
     {/* <Match when={collection() && dataVertex()}>
            <PageItemRender metaVertex={props.vertex!} />
          </Match> */}
     <Match when={true}>
      <PageItemRender metaVertex={props.metaVertex!} data={props.data} />
     </Match>
    </Switch>
   </Show>
  </PageContext.Provider>
 );
}