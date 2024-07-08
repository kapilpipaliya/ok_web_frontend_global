import { useParams } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { Match, Switch } from "solid-js";

import { PageDesignerLabels } from "~/components/page_designer/functions/constant";
import { PageDesignerWrapper } from "~/components/page_designer/layout/PageDesignerWrapper";
import { useGraph } from "~/lib/graph/graph";

const DynamicForm = clientOnly(() => import("~/components/form/DynamicForm"));

export default function FormEdit() {
  const params = useParams();
  const [graph, setGraph] = useGraph();

  return (
    <Switch>
      <Match when={PageDesignerLabels.includes(params.entity)}>
        <PageDesignerWrapper />
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
