import { Suspense } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import { PageViewWrapper } from "~/pages/PageViewWrapper";
import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { GraphContext } from "~/lib/graph/context/GraphContext";

export function PreviewIsolated(props: {
  formId: Id;
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
}) {
  return (
    <Suspense>
      <GraphContext.Provider value={[props.graph, props.setGraph]}>
        {/* Note: Its assuming the "Page" component type */}
        <PageViewWrapper
          formId={props.formId}
          hideSaveCancelButton
          isNoPermissionCheck={true}
        />
      </GraphContext.Provider>
    </Suspense>
  );
}
