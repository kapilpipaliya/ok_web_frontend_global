import { useParams } from "@solidjs/router";
import { DynamicForm } from "~/components/form/DynamicForm";

import { Match, Switch, useContext } from "solid-js";
import { GraphContext } from "~/lib/graph/graph";
import LayoutDragAndDrop from "~/pages/drag_drop/Layout_DragAndDrop";
import PageDesignerContext from "~/pages/drag_drop/PageDesignerContext";
import { PageDesignerLabels } from "~/lib/drag_drop/constant";

export default function admin() {
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
