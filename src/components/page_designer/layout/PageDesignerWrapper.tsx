import { makeEventListener } from "@solid-primitives/event-listener";
import { debounce } from "@solid-primitives/scheduled";
import { Title } from "@solidjs/meta";
import { type JSX, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { isServer } from "solid-js/web";

import { ZIndex } from "~/components/ZIndex";
import {
  DesignerLayoutStoreContext,
  getInitialDesignerLayoutStore,
} from "~/components/page_designer/LayoutContext";

import { HeaderRow } from "../header/header_row/HeaderRow";
import { RenderMainContent } from "./RenderMainContent";
import { getPageTitle } from "./getPageTitle";

export function PageDesignerWrapper(): JSX.Element {
  const pageDesignerStore = createStore(
    getInitialDesignerLayoutStore(),
  );
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
    if (isServer) return;
    handleResize(); // Initial check

    makeEventListener(window, "resize", debouncedHandleResize);
  });

  return (
    <ZIndex>
      <DesignerLayoutStoreContext.Provider
        value={pageDesignerStore}
      >
        <Title>{getPageTitle(layoutStore.formStore?.formData)}</Title>
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
