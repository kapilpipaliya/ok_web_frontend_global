import { useKeyedContext } from "@corvu/utils/create/keyedContext";
import { SetStoreFunction } from "solid-js/store";

import { GraphContext, GraphInterface } from "~/lib/graph/graph";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

// Just for example, dont use it anywhere.
export function TemplateRenderer(props: { context?: any, name: string }) {
  const graph = useKeyedContext("templateGraph") as [GraphInterface, SetStoreFunction<GraphInterface>];
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
