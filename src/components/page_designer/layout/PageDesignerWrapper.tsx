import { makeEventListener } from "@solid-primitives/event-listener";
import { debounce } from "@solid-primitives/scheduled";
import { Title } from "@solidjs/meta";
import { type JSX, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { isServer } from "solid-js/web";

import { getTableData } from "~/components/grid/functions/getTableData";
import {
  DesignerLayoutStoreContext,
  getInitialDesignerLayoutStore,
} from "~/components/page_designer/LayoutContext";
import { ZIndex } from "~/components/ZIndex";
import { getErrorMessage } from "~/lib/api/getErrorMessage";
import { isValidResponse } from "~/lib/api/isValidResponse";
import { useGraph } from "~/lib/graph/graph";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { FormMetaData } from "~/lib/meta/formMetaData";

import { HeaderRow } from "../header/header_row/HeaderRow";
import { getPageTitle } from "./getPageTitle";
import { RenderMainContent } from "./RenderMainContent";

export function PageDesignerWrapper(): JSX.Element {
  const pageDesignerStore = createStore(getInitialDesignerLayoutStore());
  const [graph, setGraph] = useGraph();
  const [layoutStore, setLayoutStore] = pageDesignerStore;

  const handleResize = () => {
    const isSmallScreen = window.innerWidth < 840;
    setLayoutStore({
      isLeftOpen: !isSmallScreen,
      isRightOpen: !isSmallScreen,
      isSmallScreen,
    });
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
      FormMetaData.CompExample,
      "CompExample",
      undefined,
      undefined,
      false,
    );
    if (isValidResponse(data)) {
      setGraphData(graph, setGraph, data.graph);
    } else {
      console.error("error", getErrorMessage(data));
    }
  };

  return (
    <ZIndex>
      <DesignerLayoutStoreContext.Provider value={pageDesignerStore}>
        <Title>{getPageTitle(layoutStore.formStore[0]?.formData)}</Title>
        <HeaderRow />
        <div
          classList={{
            "display:none": layoutStore.selectedSection === "setting",
          }}
        >
          <RenderMainContent />
        </div>
      </DesignerLayoutStoreContext.Provider>
    </ZIndex>
  );
}
