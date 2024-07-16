import { makeEventListener } from "@solid-primitives/event-listener";
import { debounce } from "@solid-primitives/scheduled";
import { Title } from "@solidjs/meta";
import { type JSX, Show, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { isServer } from "solid-js/web";

import { ZIndex } from "~/components/ZIndex";
import {
  DesignerLayoutStoreContext,
  getInitialDesignerLayoutStore,
} from "~/components/page_designer/LayoutContext";

import { HeaderRow } from "../header/HeaderRow";
import { PageSetting } from "./PageSetting";
import { RenderMainContent } from "./RenderMainContent";

export function PageDesignerWrapper(): JSX.Element {
  const [layoutStore, setLayoutStore] = createStore(
    getInitialDesignerLayoutStore(),
  );

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
        value={[layoutStore, setLayoutStore]}
      >
        <Title>{layoutStore.formData?.formData?.P.name ?? `New ${layoutStore.formData?.formData?.L[0] ?? "Form"} Builder`} - Easy Form Forge</Title>
        <HeaderRow />
        <div
          classList={{
            "display:none": layoutStore.selectedSection === "setting",
          }}
        >
          <RenderMainContent />
        </div>
        <div
          classList={{
            "display:none": layoutStore.selectedSection === "build",
          }}
        >
          <PageSetting />
        </div>
      </DesignerLayoutStoreContext.Provider>
    </ZIndex>
  );
}
