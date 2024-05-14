import { useParams } from "@solidjs/router";
import {
 AbstractSingleForm
} from "~/components/dynamic/components/DynamicForm";

import { useContext } from "solid-js";
import { GraphContext } from "~/lib/graph/graph";
import { API, DataFetcher } from "~/components/api/DataFetcher";
import { createStore } from "solid-js/store";
import { IFormContext } from "~/lib/Utils";

export default function admin() {
  const params = useParams();
  const [graph, setGraph] = useContext(GraphContext)!;
  const config = createStore({} as { formData: IFormContext });
  return (
    <DataFetcher
      fetchData={API.getFormDataUrl}
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
