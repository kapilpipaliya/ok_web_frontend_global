import { useParams } from "@solidjs/router";

import { DynamicForm } from "~/components/form/DynamicForm";
import { useGraph } from "~/lib/graph/graph";

export function FormConfig() {
  const params = useParams();
  const [graph, setGraph] = useGraph();
  return (
    <DynamicForm
      buttonAlign={"center"}
      formId={params.entity}
      graph={graph}
      id={params.id}
      importExportButtons={false}
      setGraph={setGraph}
      showMainFieldsOnly={true}
      showSaveCancelButton={false}
    />
  );
}
