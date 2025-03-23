import { createMemo, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";

import type { Id, Vertex } from "~/lib/graph/graph";

import { useRepeaterVertexContext } from "~/features/page_attr_render/context/DataContext";
import { getDataVertex } from "~/features/page_attr_render/functions/getDataVertex";
import { PageAttrRender } from "~/features/page_attr_render/PageAttrRender";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import {
  PreviewContext,
  type PreviewStoreObject,
} from "~/features/page_designer/context/PreviewContext";
import { deNullify } from "~/lib/data_structure/object/deNullify";
import { useGraph } from "~/lib/graph/GraphContext";

import type { FormStoreObject } from "../../components/form/context/FormContext";

import { getComponentDefaultValues } from "../../components/fields/component/functions/getComponentDefaultValues";
import { DataContext } from "./context/PageAttrContext";

export function PageView(
  props: Readonly<{
    context?: any;
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
  const [graph, setGraph] = useGraph();

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
    get context() {
      return props.context;
    },
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

  const ComponentWrapper = () => {
    const context = useRepeaterVertexContext() || {};
    const formStoreId = useDesignerFormIdContext();

    const values = createMemo(() => {
      const formStore = graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
      const componentValue = formStore?.P.componentValue
        ? graph.vertexes[formStore.P.componentValue]?.P
        : {};
      return {
        ...getComponentDefaultValues(props.metaVertex!, graph, setGraph),
        ...deNullify(componentValue),
      };
    });

    const repeaterStore = new Proxy(context, {
      get(target, key) {
        if (key === "props") {
          return values();
        }
        return target[key];
      },
    });
    return (
      <DataContext.Provider value={repeaterStore}>
        <PageAttrRender
          data={props.data}
          isNoPermissionCheck={props.isNoPermissionCheck!}
          metaVertex={props.metaVertex!}
        />
      </DataContext.Provider>
    );
  };

  return (
    <Show keyed when={props.metaVertex}>
      <Switch>
        <Match when={true}>
          <PreviewContext.Provider value={previewStore}>
            <Switch>
              <Match when={props.metaVertex?.L[0] === "Component"}>
                <ComponentWrapper />
              </Match>
              <Match when={true}>
                <PageAttrRender
                  data={props.data}
                  isNoPermissionCheck={props.isNoPermissionCheck!}
                  metaVertex={props.metaVertex!}
                />
              </Match>
            </Switch>
          </PreviewContext.Provider>
        </Match>
      </Switch>
    </Show>
  );
}
