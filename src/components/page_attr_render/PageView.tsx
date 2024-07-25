import { Match, Show, Switch, createMemo } from "solid-js";

import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import { getDataVertex } from "~/components/page_attr_render/utils/getDataVertex";
import { PreviewContext } from "~/lib/contexts";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import { RepeaterVertexContext, useRepeaterVertexContext } from "./PageAttrContext";

export function PageView(
  props: Readonly<{
    data?: Vertex;
    isPreview?: boolean;
    metaVertex?: Vertex;
  }>,
) {
  const [graph, setGraph] = useGraph();

  const dataVertex = createMemo(() => getDataVertex(graph, props.metaVertex));

  const Content = () => {
    return <Switch>
      <Match when={true}>
        <RepeaterVertexContext.Provider
          value={props.data ? [props.data, ...useRepeaterVertexContext()] : useRepeaterVertexContext()}
        >
          <PageAttrRender data={props.data} metaVertex={props.metaVertex!} />
        </RepeaterVertexContext.Provider>
      </Match>
    </Switch>
  }
  return (
    <Show keyed when={props.metaVertex}>
      <Switch>
        <Match when={props.isPreview}>
          <PreviewContext.Provider value={{ previewData: props.data, previewMeta: props.metaVertex! }}>
            <Content />
          </PreviewContext.Provider>
        </Match>
        <Match when={true}>
          <Content />
        </Match>
      </Switch>
    </Show>

  );
}

// export default to make it client only
export default PageView;
