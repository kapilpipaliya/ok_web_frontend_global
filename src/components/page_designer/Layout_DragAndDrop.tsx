import { type JSX, onMount, type Setter } from "solid-js";
import { HeaderDragAndDrop } from "./Header_DragAndDrop";
import { createStore } from "solid-js/store";
import { type IFormContext, PageConfigContext, } from "~/lib/contexts";
import { PageSetting } from "./PageSetting";
import { isServer } from "solid-js/web";
import { getInitialDesignerLayoutStore, DesignerLayoutStoreContext } from "~/components/page_designer/LayoutContext";
import { RenderMainContent } from "./RenderMainContent";
import { LayoutGridRowOne } from "./LayoutGridRowOne";
import { debounce } from "@solid-primitives/scheduled";
import { makeEventListener } from "@solid-primitives/event-listener";

export function LayoutDragAndDrop(): JSX.Element {
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
      <PageConfigContext.Provider
        value={createStore({} as { formData: IFormContext })}
      >
        <HeaderDragAndDrop
          selectedSection={() => layoutStore.selectedSection}
          setSelectedSection={((value: string) => setLayoutStore("selectedSection", value)) as Setter<string>}
          view={() => layoutStore.view}
          setView={((value: string) => setLayoutStore("view", value)) as Setter<string>}
        />
        <div classList={{ 'display:none': layoutStore.selectedSection === 'setting' }}>
          <LayoutGridRowOne />
          <RenderMainContent />
        </div>
        <div classList={{ 'display:none': layoutStore.selectedSection === 'build' }}>
          <PageSetting />
        </div>
      </PageConfigContext.Provider>
    </DesignerLayoutStoreContext.Provider>
  );
}
