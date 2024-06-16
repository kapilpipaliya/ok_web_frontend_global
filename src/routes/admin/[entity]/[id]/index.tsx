import { useParams } from "@solidjs/router";

import { Match, Switch, useContext } from "solid-js";
import { clientOnly } from "@solidjs/start";
import { GraphContext } from "~/lib/graph/graph";

import { PageDesignerLabels } from "~/lib/drag_drop/constant";
import { LayoutDragAndDrop } from "~/components/page_designer/Layout_DragAndDrop";

const PageDesignerContext = clientOnly(() => import("~/components/page_designer/PageDesignerContext"));
const DynamicForm = clientOnly(() => import("~/components/form/DynamicForm"));

export default function FormEdit() {
  const params = useParams();
  const [graph, setGraph] = useContext(GraphContext)!;

  return (
    <Switch>
      <Match when={PageDesignerLabels.includes(params.entity)}>
        <PageDesignerContext>
          <LayoutDragAndDrop />
        </PageDesignerContext>
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
