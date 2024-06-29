import { useParams } from "@solidjs/router";

import { Match, Switch, useContext } from "solid-js";
import { clientOnly } from "@solidjs/start";
import { GraphContext } from "~/lib/graph/graph";

import { PageDesignerLabels } from "~/lib/drag_drop/constant";
import { LayoutDragAndDrop } from "~/components/page_designer/layout/Layout_DragAndDrop";

const DynamicForm = clientOnly(() => import("~/components/form/DynamicForm"));

export default function FormEdit() {
  const params = useParams();
  const [graph, setGraph] = useContext(GraphContext)!;

  return (
    <Switch>
      <Match when={PageDesignerLabels.includes(params.entity)}>
        <LayoutDragAndDrop />
      </Match>
      <Match when={true}>
        <DynamicForm
          graph={graph}
          formId={params.entity}
          id={params.id}
          setGraph={setGraph}
        />
      </Match>
    </Switch>
  );
}
