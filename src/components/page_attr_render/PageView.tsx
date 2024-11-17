import { createMemo, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";

import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import { getDataVertex } from "~/components/page_attr_render/utils/getDataVertex";
import {
  PreviewContext,
  type PreviewStoreObject,
} from "~/components/page_designer/context/PreviewContext";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";

import {
  RepeaterVertexContext,
  useRepeaterVertexContext,
} from "./context/PageAttrContext";

export function PageView(
  props: Readonly<{
    data?: Vertex;
    hasDeletePermission?: boolean | null;
    hasEditPermission?: boolean | null;
    hasInsertPermission?: boolean | null;
    hasViewPermission?: boolean | null;
    id?: Id;
    isDesignMode?: boolean;
    isNoPermissionCheck?: boolean;
    metaVertex?: Vertex;
  }>,
) {
  const [graph, _setGraph] = useGraph();

  const _dataVertex = createMemo(() => getDataVertex(graph, props.metaVertex));

  const isViewOnlyForm = createMemo(() => {
    if (!(props.id || props.hasInsertPermission)) {
      return true;
    }
    if (props.id && !props.hasEditPermission) {
      return props.hasViewPermission;
    }
  });

  const previewStore = createStore<PreviewStoreObject>({
    get hasDeletePermission() {
      return props.hasDeletePermission;
    },
    get hasEditPermission() {
      return props.hasEditPermission;
    },
    get hasInsertPermission() {
      return props.hasInsertPermission;
    },
    get hasViewPermission() {
      return props.hasViewPermission;
    },
    get id() {
      return props.id;
    },
    get isDesignMode() {
      return props.isDesignMode;
    },
    get isNoPermissionCheck() {
      return props.isNoPermissionCheck;
    },
    get isViewOnly() {
      return isViewOnlyForm();
    },
    get previewData() {
      return props.data;
    },
    get previewMeta() {
      return props.metaVertex;
    },
  });

  return (
    <Show keyed when={props.metaVertex}>
      <Switch>
        <Match when={true}>
          <PreviewContext.Provider value={previewStore}>
            <RepeaterVertexContext.Provider
              value={
                props.data
                  ? [props.data, ...useRepeaterVertexContext()]
                  : useRepeaterVertexContext()
              }
            >
              <PageAttrRender
                data={props.data}
                metaVertex={props.metaVertex!}
              />
            </RepeaterVertexContext.Provider>
          </PreviewContext.Provider>
        </Match>
      </Switch>
    </Show>
  );
}

// export default to make it client only
export default PageView;
