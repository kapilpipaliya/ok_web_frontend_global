import { createMemo, Switch, Match, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { FormStoreObject } from "~/components/form/context/FormContext";
import { useGraph } from "~/lib/graph/context/UseGraph";
import {
  useDataContext,
  DataContext,
} from "~/features/page_attr_render/context/DataContext";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { getComponentDefaultValues } from "~/components/fields/component/functions/getComponentDefaultValues";
import { deNullify } from "~/lib/data_structure/object/deNullify";
import { PageAttrRender } from "~/features/page_attr_render/PageAttrRender";
import { useFunctionProxy } from "~/components/form/dynamic_component/hooks/useFunctionProxy";
import { createDynamicPropsMemo } from "~/components/form/dynamic_component/functions/createDynamicPropsMemo";
import { useComponentLifecycle } from "~/components/form/dynamic_component/hooks/useComponentLifecycle";
import { HtmlField } from "~/components/fields/HtmlField";
import {
  PageRenderContextProvider,
  type PageRenderObject,
} from "./context/PageRenderContext";

export interface ComponentWrapperProps {
  metaVertex: Vertex;
  data?: Vertex;
  isNoPermissionCheck?: boolean;
}

/**
 * ComponentWrapper provides the necessary context and props handling
 * for rendering Component vertices. It wraps the component with proper
 * data context that includes the component's props from variant values.
 */
export function ComponentWrapper(props: ComponentWrapperProps) {
  const [graph, setGraph] = useGraph();
  const contextData = useDataContext() || {};
  const formStoreId = useDesignerFormIdContext();

  const values = createMemo(() => {
    const formStore = graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
    const componentValue = formStore?.P.componentValue
      ? graph.vertexes[formStore.P.componentValue]?.P
      : {};
    return {
      ...getComponentDefaultValues(props.metaVertex, graph, setGraph),
      ...deNullify(componentValue),
    };
  });

  // Setup function proxy for component functions
  const { functionProxy, getFunctionArgumentWithValue, setRef, setMounted } =
    useFunctionProxy({
      props: {
        get meta() {
          return props.metaVertex;
        },
        get data() {
          return props.data;
        },
      },
      value: () => props.data,
      componentName: () => props.metaVertex.P.key as string,
      isNoPermissionCheck: () => props.isNoPermissionCheck ?? false,
      isViewMode: () => false,
      hasFullPermission: () => true,
      hasEditPermission: () => true,
      hasCreatePermission: () => true,
      hasViewPermission: () => true,
    });

  // Evaluate dynamic props from metaVertex
  const dynamicProps = createDynamicPropsMemo(
    {
      get meta() {
        return props.metaVertex;
      },
    },
    {
      graph,
      getFunctionArgumentWithValue,
    },
  );

  // Lifecycle setup
  useComponentLifecycle({
    dynamicProps,
    getFunctionArgumentWithValue,
    setMounted,
  });

  onCleanup(() => {
    setRef(null);
    setMounted(false);
  });

  const newDataContext = new Proxy(contextData, {
    get(target, key) {
      if (key === "props") {
        return values();
      }
      if (key === "index") {
        return 0;
      }
      return target[key];
    },
  });

  // Create PageRenderContext store for this component's entire function argument
  const componentRenderStore = createStore({
    get context() {
      return getFunctionArgumentWithValue();
    },
  });

  const MainContent = () => (
    <PageAttrRender
      data={props.data}
      isNoPermissionCheck={props.isNoPermissionCheck!}
      metaVertex={props.metaVertex}
    />
  );

  return (
    <DataContext.Provider value={newDataContext}>
      <PageRenderContextProvider store={componentRenderStore}>
        <Switch>
          <Match
            when={
              dynamicProps().data ||
              dynamicProps().expression ||
              dynamicProps().serverFunction
            }
          >
            <HtmlField
              data={dynamicProps().data}
              expression={dynamicProps().expression}
              serverFunction={dynamicProps().serverFunction}
              loop={dynamicProps().loop}
              contextName={dynamicProps().contextName}
              renderChildren
            >
              <MainContent />
            </HtmlField>
          </Match>
          <Match when={true}>
            <MainContent />
          </Match>
        </Switch>
      </PageRenderContextProvider>
    </DataContext.Provider>
  );
}
