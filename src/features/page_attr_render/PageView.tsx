import { createMemo, Match, Show, Switch, JSX } from "solid-js";
import { createStore } from "solid-js/store";

import { PageAttrRender } from "~/features/page_attr_render/PageAttrRender";
import {
  PreviewContext,
  type PreviewStoreObject,
} from "~/features/page_designer/context/PreviewContext";
import {
  DataContext,
} from "~/features/page_attr_render/context/DataContext";
import {
  PageRenderContextProvider,
  type PageRenderObject,
} from "./context/PageRenderContext";
import { createFunctionProxy } from "~/components/form/createFunctionProxy";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { SlotContext } from "~/components/fields/component/contexts/SlotContext";
import { evalExpression } from "~/lib/expression_eval";
import { ComponentWrapper } from "./ComponentWrapper";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";

export function PageView(
  props: Readonly<{
    context?: Record<string, unknown>;
    data?: Vertex;
    hasFullPermission?: boolean | null;
    hasEditPermission?: boolean | null;
    hasCreatePermission?: boolean | null;
    hasViewPermission?: boolean | null;
    id?: Id;
    isDesignMode?: boolean;
    isNoPermissionCheck?: boolean;
    metaVertex?: Vertex;
  }>,
) {
  const [graph, setGraph] = useGraph();

  const isViewOnlyForm = createMemo(() => {
    if (!(props.id || props.hasCreatePermission)) {
      return true;
    }
    if (props.id && !props.hasEditPermission) {
      return props.hasViewPermission;
    }
  });

  // Function to find and log layout vertexes
  const logLayoutVertexes = () => {
    if (props.metaVertex) {
      // First get all Layout vertices from the data vertex
      const layoutVertices = evalExpression("->$0Layout", {
        graph,
        setGraph,
        vertexes: [props.metaVertex],
      }) || [];
      
      // Sort by displayOrder
      const sortedLayouts = layoutVertices.sort((a: Vertex, b: Vertex) => 
        (a.P.displayOrder || 0) - (b.P.displayOrder || 0)
      );

      // Collect all component vertices
      const allComponents: Vertex[] = [];
      
      // For each sorted layout, find its Component
      for (const layoutVertex of sortedLayouts) {
        const componentName = layoutVertex.P.componentName;
        const components = componentName 
          ? [findVertexByLabelAndUniqueId(graph, "Component", "key", componentName)].filter(Boolean) as Vertex[]
          : [];
        
        // Add components to the array
        allComponents.push(...components);
      }
      
      return allComponents;
    }
    
    return [];
  };

  // Calculate layout components for Page vertices
  const layouts = createMemo(() => {
    if (props.metaVertex?.L[0] === "Page") {
      return logLayoutVertexes();
    }
    return [];
  });

  const previewStore = createStore<PreviewStoreObject>({
    get context() {
      return props.context;
    },
    get hasFullPermission() {
      return props.hasFullPermission;
    },
    get hasEditPermission() {
      return props.hasEditPermission;
    },
    get hasCreatePermission() {
      return props.hasCreatePermission;
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

  const dynamicFns = createMemo(() => {
    try {
      // Helper to evaluate fns from a vertex
      // need to pass object because getting error:
      // get' on proxy: property 'Symbol(solid-proxy)' is a read-only and non-configurable data property on the proxy target but the proxy did not return its actual value
      // (expected '#<Object>' but got 'undefined')
      // because in createFunctionProxy we return dynamicFns() in case of $PROXY
      const evaluateFns = (
        fns:
          | ((args: FunctionArgumentType) => Record<string, unknown>)
          | string
          | undefined
          | null,
      ) => {
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
        },
      };
    },
  } as PageRenderObject);

  // Inner component to handle recursive layout rendering
  const LayoutRenderer = (innerProps: { index: number; content: JSX.Element }) => {
    const currentLayout = createMemo(() => 
      innerProps.index < layouts().length ? layouts()[innerProps.index] : null
    );
    
    const LayoutContent = () => {
      const SlotChildren = (childProps: { slot?: string }) => {
        return (
          <Show
            when={!childProps.slot || childProps.slot === 'children'}
            fallback={null}
          >
            <LayoutRenderer 
              index={innerProps.index + 1} 
              content={innerProps.content} 
            />
          </Show>
        );
      };
      
      return (
        <SlotContext.Provider value={SlotChildren}>
          {/*<Show*/}
          {/*  when={currentLayout()?.L[0] === "Component"}*/}
          {/*  fallback={*/}
          {/*    <DataContext.Provider value={{ index: 0 }}>*/}
          {/*      <PageAttrRender*/}
          {/*        data={props.data}*/}
          {/*        isNoPermissionCheck={props.isNoPermissionCheck}*/}
          {/*        metaVertex={currentLayout()!}*/}
          {/*      />*/}
          {/*    </DataContext.Provider>*/}
          {/*  }*/}
          {/*>*/}
            <ComponentWrapper 
              metaVertex={currentLayout()!}
              data={props.data}
              isNoPermissionCheck={props.isNoPermissionCheck}
            />
          {/*</Show>*/}
        </SlotContext.Provider>
      );
    };
    
    return (
      <Show
        when={currentLayout()}
        fallback={innerProps.content}
      >
        <LayoutContent />
      </Show>
    );
  };

  const MainContent = () => (
    <Switch>
      <Match when={props.metaVertex?.L[0] === "Component"}>
        <ComponentWrapper 
          metaVertex={props.metaVertex!}
          data={props.data}
          isNoPermissionCheck={props.isNoPermissionCheck}
        />
      </Match>
      <Match when={true}>
        <DataContext.Provider value={{ index: 0 }}>
          <PageAttrRender
            data={props.data}
            isNoPermissionCheck={props.isNoPermissionCheck!}
            metaVertex={props.metaVertex!}
          />
        </DataContext.Provider>
      </Match>
    </Switch>
  );

  return (
    <Show when={props.metaVertex}>
      <PreviewContext.Provider value={previewStore}>
        <PageRenderContextProvider store={repeterStore}>
          <Show
            when={layouts().length > 0} 
            fallback={<MainContent/>}
          >
            <LayoutRenderer index={0} content={<MainContent/>} />
          </Show>
        </PageRenderContextProvider>
      </PreviewContext.Provider>
    </Show>
  );
}
