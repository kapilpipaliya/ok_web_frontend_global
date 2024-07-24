import { useParams } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { Match, Switch } from "solid-js";

import { PageDesignerLabels } from "~/components/page_designer/functions/constant";
import { PageDesignerWrapper } from "~/components/page_designer/layout/PageDesignerWrapper";
import { useGraph } from "~/lib/graph/graph";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { FormMetaDataAuth } from "~/lib/meta/formMetaDataAuth";
import { PageViewWrapper } from "~/pages/PageViewWrapper";

const DynamicForm = clientOnly(() => import("~/components/form/DynamicForm"));

export default function FormEdit() {
  const params = useParams();
  const [graph, setGraph] = useGraph();

  return (
    <Switch>
      <Match when={PageDesignerLabels.includes(params.entity)}>
        <PageDesignerWrapper />
      </Match>
      <Match when={!Object.keys(FormMetaData).includes(params.entity) && !Object.keys(FormMetaDataAuth).includes(params.entity)}>
        <PageViewWrapper dataId={params.id} pageVertexLabel={"Form"} pageVertexName={params.entity} />
      </Match>
      <Match when={true}>
        <DynamicForm
          formId={params.entity}
          graph={graph}
          id={params.id}
          setGraph={setGraph}
        />
      </Match>
    </Switch>
  );
}
