import { Suspense } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import { PageViewWrapper } from "~/pages/PageViewWrapper";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { GraphContext } from "~/lib/graph/context/GraphContext";
import type { Vertex } from "~/lib/graph/type/vertex";

export function PreviewIsolated(props: {
  item: Vertex;
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
}) {
  return (
    <Suspense>
      <GraphContext.Provider value={[props.graph, props.setGraph]}>
        {/* Note: Its assuming the "Page" component type */}
        <PageViewWrapper
          formId={props.item.id}
          hideSaveCancelButton
          isNoPermissionCheck={true}
          pageVertexName={props.item.L[0]}
        />
      </GraphContext.Provider>
    </Suspense>
  );
}
