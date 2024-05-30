import { useParams } from "@solidjs/router";
import { AbstractSingleForm } from "~/components/dynamic/components/DynamicForm";

import { Match, Show, Switch, useContext } from "solid-js";
import { GraphContext } from "~/lib/graph/graph";
import { createStore } from "solid-js/store";
import { IFormContext } from "~/lib/Utils";
import LayoutDragAndDrop from "~/pages/drag-drop/Layout/Layout-DragAndDrop";
import PageDesignerContext from "~/pages/utils/PageDesignerContext";

export default function admin() {
  const params = useParams();
  const [graph, setGraph] = useContext(GraphContext)!;
  const config = createStore({} as { formData: IFormContext });
  console.log(params.entity, params.id);

  return (
    <Switch>
      <Match when={(params.entity === 'Form' || params.entity === 'Page')}>
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
