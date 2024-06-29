import { type JSX, onCleanup, onMount, type Setter, Show } from "solid-js";
import { HeaderDragAndDrop } from "./Header_DragAndDrop";
import { createStore } from "solid-js/store";
import { type IFormContext, PageConfigContext, } from "~/lib/contexts";
import { PageSetting } from "./PageSetting";
import { isServer } from "solid-js/web";
import { Stepper } from "./Stepper";
import { useLocation } from "@solidjs/router";
import { UndoRedoIcons } from "./UndoRedoIcons";
import { getInitialDesignerLayoutStore, InitialLayoutStoreContext } from "~/components/page_designer/LayoutContext";
import { RenderLeftToggleButton } from "./RenderLeftToggleButton";
import { RenderRightToggleButton } from "./RenderRightToggleButton";
import { RenderMainContent } from "./RenderMainContent";

export function LayoutDragAndDrop(): JSX.Element {
  const location = useLocation();
  const [store, setStore] = createStore(getInitialDesignerLayoutStore());

  const handleResize = () => {
    const isSmallScreen = window.innerWidth < 840;
    setStore({
      isSmallScreen,
      isLeftOpen: !isSmallScreen,
      isRightOpen: !isSmallScreen,
    });
  };

  const debounce = (func: Function, wait: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const debouncedHandleResize = debounce(handleResize, 200);

  onMount(() => {
    if (isServer) return;

    window.addEventListener("resize", debouncedHandleResize);
    handleResize(); // Initial check

    onCleanup(() => {
      window.removeEventListener("resize", debouncedHandleResize);
    });
  });

  return (
    <InitialLayoutStoreContext.Provider value={[store, setStore]}>
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
          <div class={`grid ${(store.isLeftOpen && store.isRightOpen)
            ? 'grid-cols:1'
            : (!store.isLeftOpen && !store.isRightOpen)
              ? 'grid-cols:3'
              : 'grid-cols:2'} gap:4px`}>
            <Show when={!store.isLeftOpen || store.isSmallScreen}>
              <RenderLeftToggleButton />
            </Show>
            <div class="ai:center flex gap:5 p:8 jc:center">
              <UndoRedoIcons />
              <Show when={location.pathname.includes("/admin/Form/")}>
                <Stepper />
              </Show>
            </div>
            <Show when={!store.isRightOpen || store.isSmallScreen}>
              <RenderRightToggleButton />
            </Show>
          </div>
          <RenderMainContent />
        </div>
        <div classList={{ 'display:none': store.selectedSection === 'build' }}>
          <PageSetting />
        </div>
      </PageConfigContext.Provider>
    </InitialLayoutStoreContext.Provider>
  );
}
