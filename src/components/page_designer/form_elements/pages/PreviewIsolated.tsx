import { SetStoreFunction } from "solid-js/store";
import { GraphInterface, GraphContext, Id } from "~/lib/graph/graph";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

export function PreviewIsolated(props: { formId: Id; graph: GraphInterface; setGraph: SetStoreFunction<GraphInterface>; }) {
  return <GraphContext.Provider value={[props.graph, props.setGraph]}>
    {/* Note: Its assuming the "Form" component type */}
    <PageViewWrapper
      formId={props.formId}
      isNoPermissionCheck={true}
      hideSaveCancelButton />
  </GraphContext.Provider>;
}
