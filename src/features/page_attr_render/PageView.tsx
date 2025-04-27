import { createMemo, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Id, Vertex } from "~/lib/graph/graph";

import { getComponentDefaultValues } from "~/components/fields/component/functions/getComponentDefaultValues";
import { PageAttrRender } from "~/features/page_attr_render/PageAttrRender";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import {
  PreviewContext,
  type PreviewStoreObject,
} from "~/features/page_designer/context/PreviewContext";
import { deNullify } from "~/lib/data_structure/object/deNullify";
import { useGraph } from "~/lib/graph/GraphContext";
import {DataContext, useDataContext} from "~/features/page_attr_render/context/DataContext";
import { PageRenderContextProvider, PageRenderObject } from "./context/PageRenderContext";
import { createFunctionProxy } from "~/components/form/createFunctionProxy";
import { getDataVertex } from "./functions/getDataVertex";
import { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

export function PageView(
  props: Readonly<{
    context?: Record<string, unknown>;
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
    const contextData = useDataContext() || {};
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

    const newDataContext = new Proxy(contextData, {
      get(target, key) {
        if (key === "props") {
          return values();
        }
        return target[key];
      },
    });
    return (
      <DataContext.Provider value={newDataContext}>
        <PageAttrRender
          data={props.data}
          isNoPermissionCheck={props.isNoPermissionCheck!}
          metaVertex={props.metaVertex!}
        />
      </DataContext.Provider>
    );
  };
  const dynamicFns = createMemo(() => {
    try {
       // Helper to evaluate fns from a vertex
       // need to pass object because getting error:
       // get' on proxy: property 'Symbol(solid-proxy)' is a read-only and non-configurable data property on the proxy target but the proxy did not return its actual value
       // (expected '#<Object>' but got 'undefined')
       // because in createFunctionProxy we return dynamicFns() in case of $PROXY
       const evaluateFns = (fns: ((args: FunctionArgumentType) => Record<string, unknown>) | string | undefined | null) => {
        if (typeof fns === "function") {
          return fns(previewStore[0].context) || {};
        }
        if (typeof fns === "string") {
          try {
            return new Function("args", fns)(previewStore[0].context) || {};
          } catch (error) {
            console.error("Error evaluating fns:", error);
            return {};
          }
        }
        return {};
      };
      
      return evaluateFns(props.metaVertex?.P.fns);
    } catch (error) {
      console.error("Error in dynamicFns:", error);
      return {};
    }
  });

  const functionProxy = createFunctionProxy(dynamicFns, () => undefined);
  const repeterStore = createStore({
    get context() {
      return {
        get fns() {
          return functionProxy;
        }
      }
    }
  } as PageRenderObject) ;

  return (
    <Show keyed when={props.metaVertex}>
      <PageRenderContextProvider store={repeterStore}>
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
      </PageRenderContextProvider>
    </Show>
  );
}
