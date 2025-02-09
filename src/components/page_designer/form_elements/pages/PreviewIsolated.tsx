import type { SetStoreFunction } from "solid-js/store";

import { GraphContext, type GraphInterface, type Id } from "~/lib/graph/graph";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export function PreviewIsolated(props: {
  formId: Id;
  graph: GraphInterface;
  setGraph: SetStoreFunction<GraphInterface>;
}) {
  return (
    <GraphContext.Provider value={[props.graph, props.setGraph]}>
      {/* Note: Its assuming the "Form" component type */}
      <PageViewWrapper
        formId={props.formId}
        hideSaveCancelButton
        isNoPermissionCheck={true}
      />
    </GraphContext.Provider>
  );
}
