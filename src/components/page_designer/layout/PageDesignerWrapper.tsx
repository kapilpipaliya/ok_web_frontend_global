import { makeEventListener } from "@solid-primitives/event-listener";
import { debounce } from "@solid-primitives/scheduled";
import { Title } from "@solidjs/meta";
import { type JSX, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { isServer } from "solid-js/web";

import { ZIndex } from "~/components/fields/ZIndex";
import { getTableData } from "~/components/grid/functions/getTableData";
import { v7 as uuidv7 } from "uuid";
import {
  DesignerLayoutStoreContext,
  getInitialDesignerLayoutStore,
  PageLayoutObject,
  useDesignerFormIdContext,
} from "~/components/page_designer/context/LayoutContext";
import { getErrorMessage } from "~/lib/api/getErrorMessage";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { addNewVertex, deleteVertex, mergeVertexProperties, newVertex } from "~/lib/graph/mutate/vertex";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { HeaderRow } from "../header/header_row/HeaderRow";
import { getPageTitle } from "./getPageTitle";
import { clientOnly } from "@solidjs/start";
import { useParams } from "@solidjs/router";
const RenderMainContent = clientOnly(() => import("./RenderMainContent"));

export function PageDesignerWrapper(): JSX.Element {
  const params = useParams();
  const initialStore = getInitialDesignerLayoutStore();
  const [graph, setGraph] = useGraph();

  const formId = uuidv7();

  const newOpenVertex = newVertex(uuidv7(), ["OpenForm"], {
    formId,
    label: params.entity,
    dataId: params.id,
    mainPanel: 0
  });
  addNewVertex(0, newOpenVertex, graph, setGraph);
  
  const vertex = newVertex(initialStore.id, ["PageDesigner"], {
    ...initialStore,
    openedFormIds: [newOpenVertex.id],
    formId,
  });
  addNewVertex(0, vertex, graph, setGraph);

  onCleanup(() => {
    for (const vertexId of graph.vertexes[initialStore.id].P.openedFormIds) {
      deleteVertex(0, vertexId, graph, setGraph);
    }
    deleteVertex(0, initialStore.id, graph, setGraph);
  })

  const handleResize = () => {
    const isSmallScreen = window.innerWidth < 840;
    mergeVertexProperties<PageLayoutObject>(
      0,
      initialStore.id,
      graph,
      setGraph,
      {
        isLeftOpen: !isSmallScreen,
        isRightOpen: !isSmallScreen,
        isSmallScreen,
      }
    );
  };

  const debouncedHandleResize = debounce(handleResize, 200);

  onMount(() => {
    if (isServer) {
      return;
    }
    handleResize(); // Initial check

    makeEventListener(window, "resize", debouncedHandleResize);

    fetchCompExamples();
  });

  const fetchCompExamples = async () => {
    // setGridState("isLoading", true);
    const data = await getTableData(
      graph,
      FormMetaData.CompExample,
      "CompExample",
      undefined,
      undefined,
      false,
    );
    if (isValidResponse(data)) {
      setGraphData(graph, setGraph, data.graph!);
    } else {
      console.error("error", getErrorMessage(data));
    }
  };

  const layoutStore = () => graph.vertexes[initialStore.id].P as PageLayoutObject;
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <ZIndex>
      <DesignerLayoutStoreContext.Provider value={initialStore.id}>
        <Title>{getPageTitle(graph.vertexes[formStoreVertex()?.P.formDataId!])}</Title>
        <HeaderRow />
        <div
          classList={{
            "display:none": layoutStore().selectedSection === "setting",
          }}
        >
          <RenderMainContent />
        </div>
      </DesignerLayoutStoreContext.Provider>
    </ZIndex>
  );
}
