import { createKeyedContext } from "@corvu/utils/create/keyedContext";
import { ParentProps } from "solid-js";

import { createAppState } from "~/createAppState";
import { GetInitialData } from "~/GetInitialData";
import { GlobalProperties, GraphContext } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

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
        <GetInitialData authenticate={true}>
          {props.children}
        </GetInitialData>
      </GraphContext.Provider>
    </TemplateGraph.Provider>
  );
};
