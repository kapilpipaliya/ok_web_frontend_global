import { useParams } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { Match, Switch, useContext } from "solid-js";

import { PageDesignerWrapper } from "~/components/page_designer/layout/PageDesignerWrapper";
import { PageDesignerLabels } from "~/lib/drag_drop/constant";
import { GraphContext } from "~/lib/graph/graph";

const DynamicForm = clientOnly(() => import("~/components/form/DynamicForm"));

export default function FormEdit() {
  const params = useParams();
  const [graph, setGraph] = useContext(GraphContext)!;

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
