import { GraphContext, type Vertex } from "~/lib/graph/graph";
import { createMemo, createSignal, Match, Show, Switch, useContext } from "solid-js";
import {
  PageAttrRender
} from "~/components/page_attr_render/PageAttrRender";
import { FormSettingsContext, IsPreviewContext, PageContext } from "~/lib/contexts";
import {
  getCollection
} from "~/components/page_attr_render/utils/getCollection";
import {
  getDataVertex
} from "~/components/page_attr_render/utils/getDataVertex";
import { getChildrenAttrs } from "~/lib/drag_drop/getChildrenAttrs";
import { FormWrapper } from "../fields/FormWrapper";

export function PageView(props: {
  metaVertex?: Vertex;
  data?: Vertex;
  isPreview?: boolean
}) {
  const [graph, setGraph] = useContext(GraphContext)!;
  const [formSettings, setFormSettings] = useContext(FormSettingsContext);
  const collection = createMemo(() =>
    getCollection(graph, props.metaVertex)
  );
  const dataVertex = createMemo(() =>
    getDataVertex(graph, props.metaVertex)
  );

  const isFormRootVertetx = () => props.metaVertex?.L?.[0] === "Form";
  const selectedFormVertex = () => {
    const steps = getChildrenAttrs(graph, setGraph, props.metaVertex!);
    return formSettings.activeStepId ? graph.vertexes[formSettings.activeStepId] : steps[0];
  };

  return (
    <IsPreviewContext.Provider value={createSignal(props.isPreview ?? false)}>
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
            <Match when={isFormRootVertetx()}>
              <FormWrapper meta={selectedFormVertex()!} data={props.data} label={props.metaVertex?.L?.[0]} />
            </Match>
            <Match when={true}>
              <PageAttrRender metaVertex={props.metaVertex!} data={props.data} />
            </Match>
          </Switch>
        </Show>
      </PageContext.Provider>
    </IsPreviewContext.Provider>
  );
}

// export default to make it client only
export default PageView;