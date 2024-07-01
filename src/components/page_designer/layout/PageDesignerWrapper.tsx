import { makeEventListener } from "@solid-primitives/event-listener";
import { debounce } from "@solid-primitives/scheduled";
import { type JSX, onMount, } from "solid-js";
import { createStore } from "solid-js/store";
import { isServer } from "solid-js/web";

import { DesignerLayoutStoreContext, getInitialDesignerLayoutStore } from "~/components/page_designer/LayoutContext";

import { HeaderRow } from "../header/HeaderRow";
import { LayoutGridRowOne } from "../row_one/LayoutGridRowOne";
import { PageSetting } from "./PageSetting";
import { RenderMainContent } from "./RenderMainContent";

export function PageDesignerWrapper(): JSX.Element {
  const [layoutStore, setLayoutStore] = createStore(getInitialDesignerLayoutStore());

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
    <DesignerLayoutStoreContext.Provider value={[layoutStore, setLayoutStore]}>
      <HeaderRow/>
      <div classList={{ 'display:none': layoutStore.selectedSection === 'setting' }}>
        <LayoutGridRowOne />
        <RenderMainContent />
      </div>
      <div classList={{ 'display:none': layoutStore.selectedSection === 'build' }}>
        <PageSetting />
      </div>
    </DesignerLayoutStoreContext.Provider>
  );
}
