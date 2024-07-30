import { Match, Show, Switch, createMemo } from "solid-js";
import { createStore } from "solid-js/store";

import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import { getDataVertex } from "~/components/page_attr_render/utils/getDataVertex";
import { PreviewContext, type PreviewStoreObject } from "~/components/page_designer/PreviewContext";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import { RepeaterVertexContext, useRepeaterVertexContext } from "./PageAttrContext";

export function PageView(
  props: Readonly<{
    data?: Vertex;
    hasDeletePermission?: boolean | null;
    hasEditPermission?: boolean | null;
    hasInsertPermission?: boolean | null;
    hasViewPermission?: boolean | null;
    isDesignMode?: boolean;
    metaVertex?: Vertex;
  }>,
) {
  const [graph, setGraph] = useGraph();

  const dataVertex = createMemo(() => getDataVertex(graph, props.metaVertex));

  const previewStore = createStore<PreviewStoreObject>({
    get hasDeletePermission() { return props.hasDeletePermission ?? true; },
    get hasEditPermission() { return props.hasEditPermission ?? true; },
    get hasInsertPermission() { return props.hasInsertPermission ?? true; },
    get hasViewPermission() { return props.hasViewPermission ?? true; },
    get isDesignMode() { return props.isDesignMode; },
    get previewData() { return props.data; },
    get previewMeta() { return props.metaVertex; },
  });

  return (
    <Show keyed when={props.metaVertex}>
      <Switch>
        <Match when={true}>
          <PreviewContext.Provider value={previewStore}>
            <RepeaterVertexContext.Provider
              value={props.data ? [props.data, ...useRepeaterVertexContext()] : useRepeaterVertexContext()}
            >
              <PageAttrRender data={props.data} metaVertex={props.metaVertex!} />
            </RepeaterVertexContext.Provider>
          </PreviewContext.Provider>
        </Match>
      </Switch>
    </Show>

  );
}

// export default to make it client only
export default PageView;
