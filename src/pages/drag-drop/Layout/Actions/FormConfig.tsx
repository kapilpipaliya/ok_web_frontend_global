import { useContext } from "solid-js";
import { AbstractSingleForm } from "~/components/dynamic/components/DynamicForm";
import { PageConfigContext } from "~/lib/contexts";
import { GraphContext } from "~/lib/graph/graph";
import { useParams } from "@solidjs/router";

export function FormConfig() {
  const params = useParams();
  const [graph, setGraph] = useContext(GraphContext)!;
  return (
    <AbstractSingleForm
      buttonAlign={"center"}
      formId={"Page"}
      id={params.id}
      graph={graph}
      config={useContext(PageConfigContext)}
      showMainFieldsOnly={true}
      importExportButtons={false}
      setGraph={setGraph} />
  );
}
