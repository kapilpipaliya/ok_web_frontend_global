import { useContext } from "solid-js";
import { DynamicForm } from "~/components/form/DynamicForm";
import { GraphContext } from "~/lib/graph/graph";
import { useParams } from "@solidjs/router";

export function FormConfig() {
  const params = useParams();
  const [graph, setGraph] = useContext(GraphContext)!;
  return (
    <DynamicForm
      buttonAlign={"center"}
      formId={params.entity}
      id={params.id}
      graph={graph}
      showMainFieldsOnly={true}
      importExportButtons={false}
      setGraph={setGraph}
    />
  );
}
