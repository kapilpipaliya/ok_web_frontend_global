import { type JSX, Show, onCleanup, onMount, type Setter } from "solid-js";
import { HeaderDragAndDrop } from "./Header_DragAndDrop";
import { Icon } from "@iconify-icon/solid";
import { createStore } from "solid-js/store";
import {
  type IFormContext,
  PageConfigContext,
} from "~/lib/contexts";
import { ContentDragAndDrop } from "./Content_DragAndDrop";
import { PageSetting } from "./PageSetting";
import { Drawer } from "~/components/Drawer";
import { isServer } from "solid-js/web";
import { Stepper } from "./Stepper";
import { useLocation } from "@solidjs/router";
import { ActionsDragAndDrops } from "./actions/Actions_DragAndDrops";
import { FormElementsWrapper } from "./menu/FormElementsWrapper";
import { UndoRedoIcons } from "./UndoRedoIcons";

export function LayoutDragAndDrop(): JSX.Element {
  const location = useLocation();
  const [store, setStore] = createStore({
    view: "Tablet",
    selectedSection: "build",
    isSmallScreen: false,
    leftMenuTabs: [
      { title: "Components", collection: "Comp" },
      { title: "Pages", collection: "Page" },
      { title: "Templates", collection: "TemplatePage" },
      { title: "Forms", collection: "Form" },
      { title: "Thank You", collection: "ThankYouPage" },
      { title: "Error Pages", collection: "ErrorPages" },
      { title: "Email Template", collection: "EmailTemplate" }
    ],
    rightMenuTabs: ["layout", "form"].map((column) => ({
      id: column,
      name: column,
    })),
    isLeftOpen: true,
    isRightOpen: true,
  });

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
            <div
              class={`rel flex jc:start h:50px r:0|15|15|0 p:2 cursor:pointer`}
            >
              <button
                style={{
                  cursor: "pointer",
                  padding: "15px",
                  'border-radius': "5px",
                  display: "flex",
                  gap: "10px",
                  'align-items': "center",
                }}
                // variant="soft"
                onClick={() => setStore("isLeftOpen", !store.isLeftOpen)}
                class="outline:2px|solid|transparent outline:offset|2px:focus"
              >
                <Icon
                  icon={"solar:widget-add-outline"}
                  height={22}
                  class="cursor:pointer"
                  width={22}
                  style={{ color: "#37c" }}
                />

                <span class={`font:14 cursor:pointer d:none@<sm`}>Add Form Element</span>
              </button>
            </div>
          </Show>
          <div class="ai:center flex gap:5 p:8 jc:center">
            <UndoRedoIcons />
            <Show when={location.pathname.includes("/admin/Form/")}>
              <Stepper />
            </Show>
          </div>

          <Show when={!store.isRightOpen || store.isSmallScreen}>
            <div
              class={`rel flex jc:end h:50px r:0|15|15|0 p:2 cursor:pointer`}
            >
              <button
                style={{
                  cursor: "pointer",
                  padding: "15px",
                  'border-radius': "5px",
                  display: "flex",
                  gap: "10px",
                  'align-items': "center",
                }}
                // variant="soft"
                onClick={() => setStore("isRightOpen", !store.isRightOpen)}
                class="p:15 jc:center outline:2px|solid|transparent outline:offset|2px:focus"
              >
                <span class="font:14 cursor:pointer d:none@<sm ml:10 ">View Form Settings</span>
                <Icon
                  icon={"icon-park-outline:setting-two"}
                  height={22}
                  class="cursor:pointer"
                  width={22}
                  style={{ color: "#37c" }}
                />
              </button>
            </div>
          </Show>


        </div>
        <div style={{
          'grid-template-columns':
            (!store.isLeftOpen && !store.isRightOpen)
              ? 'repeat(1, 1fr)'
              : (store.isLeftOpen && store.isRightOpen)
                ? 'repeat(3, 22% 53% 25%)'
                : `repeat(2, ${!store.isLeftOpen ? '70% 30%' : '30% 70%'} )`,
        }} class={`grid gap:4px`}>

          <Show
            when={!store.isSmallScreen}
            fallback={
              <Drawer
                customButton={() => false}
                drawerStyle={'padding: 10px'}
                open={() => store.isLeftOpen}
                setIsOpen={((v: boolean) => setStore("isLeftOpen", v)) as Setter<boolean>}
                width="75%"
              >
                <FormElementsWrapper
                  toggleIsLeftOpen={((isOpen: boolean) => setStore("isLeftOpen", isOpen)) as Setter<boolean>}
                  leftColumns={store.leftMenuTabs}
                />
              </Drawer>
            }
          >
            <div class={`${!store.isLeftOpen ? 'd:none' : ''}`}>
              <Show when={store.isLeftOpen}>
                <FormElementsWrapper
                  toggleIsLeftOpen={((isOpen: boolean) => setStore("isLeftOpen", isOpen)) as Setter<boolean>}
                  leftColumns={store.leftMenuTabs}
                />
              </Show>
            </div>
          </Show>
          <ContentDragAndDrop view={() => store.view} />
          <Show
            when={!store.isSmallScreen}
            fallback={
              <Drawer
                customButton={() => false}
                drawerStyle={'padding: 10px'}
                open={() => store.isRightOpen}
                setIsOpen={((isOpen: boolean) => setStore("isRightOpen", isOpen)) as Setter<boolean>}
                width="75%"
              >
                <ActionsDragAndDrops
                  isRightOpen={() => store.isRightOpen}
                  toggleIsRightOpen={((isOpen: boolean) => setStore("isRightOpen", isOpen)) as Setter<boolean>}
                  rightColumns={() => store.rightMenuTabs}
                />
              </Drawer>
            }
          >
            <div class={`${!store.isRightOpen ? "hidden" : "contents"}`}>
              <ActionsDragAndDrops
                isRightOpen={() => store.isRightOpen}
                toggleIsRightOpen={((isOpen: boolean) => setStore("isRightOpen", isOpen)) as Setter<boolean>}
                rightColumns={() => store.rightMenuTabs}
              />
            </div>
          </Show>
        </div>
      </div>
      <div classList={{ 'display:none': store.selectedSection === 'build' }}>
        <PageSetting />
      </div>
    </PageConfigContext.Provider>
  );
}
