import { type JSX, onMount, } from "solid-js";
import { HeaderRow } from "./HeaderRow";
import { createStore } from "solid-js/store";
import { PageSetting } from "../PageSetting";
import { isServer } from "solid-js/web";
import { getInitialDesignerLayoutStore, DesignerLayoutStoreContext } from "~/components/page_designer/LayoutContext";
import { RenderMainContent } from "./RenderMainContent";
import { LayoutGridRowOne } from "./LayoutGridRowOne";
import { debounce } from "@solid-primitives/scheduled";
import { makeEventListener } from "@solid-primitives/event-listener";

export function PageDesignerWrapper(): JSX.Element {
  const [layoutStore, setLayoutStore] = createStore(getInitialDesignerLayoutStore());

  const handleResize = () => {
    const isSmallScreen = window.innerWidth < 840;
    setLayoutStore({
      isSmallScreen,
      isLeftOpen: !isSmallScreen,
      isRightOpen: !isSmallScreen,
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
