import { For, type JSX } from "solid-js";
import { DynamicComponent } from "~/components/form/DynamicComponent";
import { getChildrenAttrs } from "~/features/page_designer/functions/layout/getChildrenAttrs";
import {
  DataContext,
  useDataContext,
} from "~/features/page_attr_render/context/DataContext";
import { useGraph } from "~/lib/graph/context/UseGraph";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { SetStoreFunction } from "solid-js/store";

export function findLoopTemplateMeta(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  startMeta: Vertex,
): Vertex | undefined {
  for (const child of getChildrenAttrs(graph, setGraph, startMeta)) {
    if (child.P.loop === true) {
      return child;
    }
    const nested = getChildrenAttrs(graph, setGraph, child).find(
      (attr) => attr.P.loop === true,
    );
    if (nested) {
      return nested;
    }
  }
  return undefined;
}

export function LoopChildrenRenderer(props: {
  loopMeta: Vertex;
  data?: Vertex;
  contextValue: unknown;
  isNoPermissionCheck: boolean;
}): JSX.Element {
  const [graph, setGraph] = useGraph();
  const parentContext = useDataContext() || {};
  const contextName = String(props.loopMeta.P.contextName ?? "item");
  const index =
    typeof props.contextValue === "object" &&
    props.contextValue !== null &&
    "index" in props.contextValue
      ? Number((props.contextValue as { index: number }).index)
      : 0;

  const childAttrs = () => getChildrenAttrs(graph, setGraph, props.loopMeta);

  const context = new Proxy(parentContext, {
    get(target, key) {
      if (key === contextName) return props.contextValue;
      if (key === `${contextName}Index`) return index;
      if (key === "index") return index;
      return target[key];
    },
  });

  return (
    <DataContext.Provider value={context}>
      <For each={childAttrs()}>
        {(item) => (
          <DynamicComponent
            data={props.data}
            isNoPermissionCheck={props.isNoPermissionCheck}
            meta={item}
          />
        )}
      </For>
    </DataContext.Provider>
  );
}
