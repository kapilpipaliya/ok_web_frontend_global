import { useParams } from "@solidjs/router";
import { AbstractSingleForm } from "~/components/dynamic/components/DynamicForm";
import { config } from "@master/css";
import { Show, useContext } from "solid-js";
import { GraphContext } from "~/lib/graph/graph";
import { API, DataFetcher } from "~/components/api/DataFetcher";

export default function admin() {
  const params = useParams();
  const [graph, setGraph] = useContext(GraphContext)!;

  return (
    <DataFetcher
      fetchData={API.fetchDataUrl}
      renderContent={
        <AbstractSingleForm
          graph={graph}
          formId={params.entity}
          id={params.id}
          config={config}
          setGraph={setGraph}
        />
      }
    />
  );
}
