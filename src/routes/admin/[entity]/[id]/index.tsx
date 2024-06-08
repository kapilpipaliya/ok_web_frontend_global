import { useParams } from "@solidjs/router";
import { AbstractSingleForm } from "~/components/dynamic/components/form/DynamicForm";

import { Match, Switch, useContext } from "solid-js";
import { GraphContext } from "~/lib/graph/graph";
import LayoutDragAndDrop from "~/pages/drag-drop/Layout/Layout-DragAndDrop";
import PageDesignerContext from "~/pages/drag-drop/Layout/PageDesignerContext";

export default function admin() {
  const params = useParams();
  const [graph, setGraph] = useContext(GraphContext)!;

  return (
    <Switch>
      <Match when={params.entity === "Form" || params.entity === "Page"}>
        <PageDesignerContext>
          <LayoutDragAndDrop />
        </PageDesignerContext>
      </Match>
      <Match when={true}>
        <AbstractSingleForm
          graph={graph}
          formId={params.entity}
          id={params.id}
          setGraph={setGraph}
        />
      </Match>
    </Switch>
  );
}
