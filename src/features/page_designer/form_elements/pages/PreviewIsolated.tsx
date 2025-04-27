import { Suspense } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

import type { Id } from "~/lib/graph/graph";

import { GraphContext, type GraphInterface } from "~/lib/graph/GraphContext";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export function PreviewIsolated(props: {
  formId: Id;
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
}) {
  return (
    <Suspense>
      <GraphContext.Provider value={[props.graph, props.setGraph]}>
        {/* Note: Its assuming the "Form" component type */}
        <PageViewWrapper
        formId={props.formId}
        hideSaveCancelButton
          isNoPermissionCheck={true}
        />
      </GraphContext.Provider>
    </Suspense>
  );
}
