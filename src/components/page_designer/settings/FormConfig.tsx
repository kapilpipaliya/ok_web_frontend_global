import { useParams } from "@solidjs/router";
import { useContext } from "solid-js";

import { DynamicForm } from "~/components/form/DynamicForm";
import { GraphContext } from "~/lib/graph/graph";

export function FormConfig() {
  const params = useParams();
  const [graph, setGraph] = useContext(GraphContext)!;
  return (
    <DynamicForm
      buttonAlign={"center"}
      formId={params.entity}
      graph={graph}
      id={params.id}
      importExportButtons={false}
      setGraph={setGraph}
      showMainFieldsOnly={true}
    />
  );
}
