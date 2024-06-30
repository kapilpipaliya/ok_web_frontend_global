import { GraphContext, type Vertex } from "~/lib/graph/graph";
import { createMemo, createSignal, Match, Show, Switch, useContext } from "solid-js";
import {
  PageAttrRender
} from "~/components/page_attr_render/PageAttrRender";
import {  IsPreviewContext, } from "~/lib/contexts";
import {
  getCollection
} from "~/components/page_attr_render/utils/getCollection";
import {
  getDataVertex
} from "~/components/page_attr_render/utils/getDataVertex";
import { getChildrenAttrs } from "~/lib/drag_drop/getChildrenAttrs";
import { FormWrapper } from "../fields/FormWrapper";
import { useDesignerLayoutStore } from "../page_designer/LayoutContext";

export function PageView(props: Readonly<{
  metaVertex?: Vertex;
  data?: Vertex;
  isPreview?: boolean
}>) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [layoutStore] = useDesignerLayoutStore() || [];
  
  const collection = createMemo(() =>
    getCollection(graph, props.metaVertex)
  );
  const dataVertex = createMemo(() =>
    getDataVertex(graph, props.metaVertex)
  );

  const isFormRootVertetx = () => props.metaVertex?.L?.[0] === "Form";
  const steps = createMemo<Vertex[]>(() =>
    getChildrenAttrs(graph, setGraph, props.metaVertex!)
  );
  const [activeStepId, setActiveStepId] = createSignal<string>(steps()[0]?.id);

  const selectedFormVertex = () => {
    if (props.isPreview) {
      return activeStepId() ? graph.vertexes[activeStepId()] : steps()[0];
    } else {
      return layoutStore.activeStepId ? graph.vertexes[layoutStore.activeStepId] : steps()[0];
    }
  };


  // Function to change active step
  const changeActiveStep = (stepId: string) => {
    setActiveStepId(stepId);
  };

  return (
    <IsPreviewContext.Provider value={createSignal(props.isPreview ?? false)}>
      {/* <PageContext.Provider value={{ events: {} }}> */}
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
          <Match when={isFormRootVertetx()}>
            <Show when={props.isPreview && steps().length > 1}>
              <div>
                <button onClick={() => changeActiveStep(steps()[Math.max(steps().indexOf(selectedFormVertex()) - 1, 0)].id)}>Previous Step</button>
                <button onClick={() => changeActiveStep(steps()[Math.min(steps().indexOf(selectedFormVertex()) + 1, steps().length - 1)].id)}>Next Step</button>
              </div>
            </Show>
            <FormWrapper meta={selectedFormVertex()} data={props.data} label={props.metaVertex?.P.name} />
          </Match>
          <Match when={true}>
            <PageAttrRender metaVertex={props.metaVertex!} data={props.data} />
          </Match>
        </Switch>
      </Show>
      {/* </PageContext.Provider> */}
    </IsPreviewContext.Provider>
  );
}

// export default to make it client only
export default PageView;