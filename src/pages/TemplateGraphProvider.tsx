import type { ParentProps } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import {
  createKeyedContext,
  useKeyedContext,
} from "@corvu/utils/create/keyedContext";

import type { GraphInterface } from "~/lib/graph/graph";

import { createAppState } from "~/createAppState";
import { GetInitialData } from "~/GetInitialData";
import { type GlobalProperties, GraphContext } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export const TemplateGraphProvider = (props: ParentProps) => {
  const graph = createAppState();
  mergeVertexProperties<GlobalProperties>(
    0,
    "globalStoreId",
    graph[0],
    graph[1],
    { url: "adminui" },
  );
  const TemplateGraph = createKeyedContext("templateGraph", graph);
  return (
    <TemplateGraph.Provider value={graph}>
      <GraphContext.Provider value={graph}>
        <GetInitialData authenticate={true}>{props.children}</GetInitialData>
      </GraphContext.Provider>
    </TemplateGraph.Provider>
  );
};

// Just for example, dont use it anywhere.
export function TemplateRenderer(props: { context?: any; name: string }) {
  const graph = useKeyedContext("templateGraph") as [
    GraphInterface,
    SetStoreFunction<GraphInterface>,
  ];
  return (
    <GraphContext.Provider value={graph}>
      <PageViewWrapper
        context={props.context}
        hideSaveCancelButton={true}
        isNoPermissionCheck={true}
        pageId={"new"}
        pageVertexLabel={"Page"}
        pageVertexName={props.name}
      />
    </GraphContext.Provider>
  );
}
