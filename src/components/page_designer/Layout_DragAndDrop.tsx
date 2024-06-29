import { type JSX, onCleanup, onMount, type Setter } from "solid-js";
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
  const [store, setStore] = createStore(getInitialDesignerLayoutStore());

  const handleResize = () => {
    const isSmallScreen = window.innerWidth < 840;
    setStore({
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
    <DesignerLayoutStoreContext.Provider value={[store, setStore]}>
      <PageConfigContext.Provider
        value={createStore({} as { formData: IFormContext })}
      >
        <HeaderDragAndDrop
          selectedSection={() => store.selectedSection}
          setSelectedSection={((value: string) => setStore("selectedSection", value)) as Setter<string>}
          view={() => store.view}
          setView={((value: string) => setStore("view", value)) as Setter<string>}
        />
        <div classList={{ 'display:none': store.selectedSection === 'setting' }}>
          <LayoutGridRowOne />
          <RenderMainContent />
        </div>
        <div classList={{ 'display:none': store.selectedSection === 'build' }}>
          <PageSetting />
        </div>
      </PageConfigContext.Provider>
    </DesignerLayoutStoreContext.Provider>
  );
}
