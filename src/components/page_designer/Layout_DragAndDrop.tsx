import { type JSX, Show, createSignal, onCleanup, onMount } from "solid-js";
import { HeaderDragAndDrop } from "./Header_DragAndDrop";
import { MenuDragAndDrop } from "~/pages/drag_drop/menu/Menu_DragAndDrop";
import { Icon } from "@iconify-icon/solid";
import { createStore } from "solid-js/store";
import {
  type IFormContext,
  PageConfigContext,

} from "~/lib/contexts";
import { ContentDragAndDrop } from "./Content_DragAndDrop";
import {CustomButton} from "~/components/solid_blocks/button/buttons";
import { useExpansion } from "./CommonCompUtils";
import { PageSetting } from "./PageSetting";
import { Tooltip } from "~/components/solid_blocks";
import {Drawer} from "~/components/Drawer";
import { isServer } from "solid-js/web";
import { Stepper } from "./Stepper";
import { useLocation } from "@solidjs/router";
import { FormSetting } from "./actions/FormSetting";
import {ActionsDragAndDrops} from "~/components/page_designer/actions/Actions_DragAndDrops";

export function LayoutDragAndDrop(): JSX.Element {
  const location = useLocation();
  const [view, setView] = createSignal("Tablet");
  const [isLeftOpen, setIsLeftOpen] = createSignal(true);
  const [isRightOpen, setIsRightOpen] = createSignal(true);
  const [selectedSection, setSelectedSection] = createSignal("build");
  const [isSmallScreen, setIsSmallScreen] = createSignal(false);
  const [leftColumns, setLeftColumns] = createSignal(
    ["components", "pages", "templates", "forms"].map((column) => ({
      id: column,
      name: column,
    })),
  );
  const [rightColumns, setRightColumns] = createSignal(
    ["layout", "form", "formSetting"].map((column) => ({
      id: column,
      name: column,
    })),
  );

  const handleResize = () => {
    setIsSmallScreen(window.innerWidth < 840);
    if (window.innerWidth < 840) {
      setIsLeftOpen(false);
      setIsRightOpen(false);
    } else {
      setIsLeftOpen(true);
      setIsRightOpen(true);
    }
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

  const UndoRedoIcons = () => {
    return (
      <>
        <Tooltip content={"Undo"} position={"n"}>
          <div
            class="b:1px|solid|lightgrey bg:white color:#000:hover color:grey flex ai:center jc:center r:7 h:30px w:30px cursor:pointer">
            <Icon icon={"ci:arrow-undo-up-left"} height={22} width={22}/>
          </div>
        </Tooltip>
        <Tooltip content={"Redo"} position={"n"}>
          <div
            class="b:1px|solid|lightgrey color:#000:hover color:grey bg:white flex ai:center jc:center r:7 h:30px w:30px cursor:pointer">
            <Icon icon={"ci:arrow-undo-up-right"} height={22} width={22}/>
          </div>
        </Tooltip>
      </>
    )
  }

  return (
    <PageConfigContext.Provider
      value={createStore({} as { formData: IFormContext })}
    >
      <HeaderDragAndDrop
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        view={view}
        setView={setView}
      />

      <div classList={{'display:none': selectedSection() === 'setting'}}>
        <div class={`grid ${(isLeftOpen() && isRightOpen())
          ? 'grid-cols:1'
          : (!isLeftOpen() && !isRightOpen())
            ? 'grid-cols:3'
            : 'grid-cols:2'} gap:4px`}>
          <Show when={!isLeftOpen() || isSmallScreen()}>
            <div
              class={`rel flex jc:start h:50px r:0|15|15|0 p:2 cursor:pointer`}
            >
              <CustomButton
                style={{
                  cursor: "pointer",
                  padding: "15px",
                  'border-radius': "5px",
                  display: "flex",
                  gap: "10px",
                  'align-items': "center",
                }}
                variant="soft"
                onClick={setIsLeftOpen}
                class="outline:2px|solid|transparent outline:offset|2px:focus"
              >
                <Icon
                  icon={"solar:widget-add-outline"}
                  height={22}
                  class="cursor:pointer"
                  width={22}
                  style={{color: "#37c"}}
                />

                <span class={`font:14 cursor:pointer d:none@<sm`}>Add Form Element</span>
              </CustomButton>
            </div>
          </Show>
          <div class="ai:center flex gap:5 p:8 jc:center">
            <UndoRedoIcons/>
            <Show when={location.pathname.includes("/admin/Form/")}>
              <Stepper/>
            </Show>
          </div>

          <Show when={!isRightOpen() || isSmallScreen()}>
            <div
              class={`rel flex jc:end h:50px r:0|15|15|0 p:2 cursor:pointer`}
            >
              <CustomButton
                style={{
                  cursor: "pointer",
                  padding: "15px",
                  'border-radius': "5px",
                  display: "flex",
                  gap: "10px",
                  'align-items': "center",
                }}
                variant="soft"
                onClick={setIsRightOpen}
                class="p:15 jc:center outline:2px|solid|transparent outline:offset|2px:focus"
              >
                <span class="font:14 cursor:pointer d:none@<sm ml:10 ">View Form Settings</span>
                <Icon
                  icon={"icon-park-outline:setting-two"}
                  height={22}
                  class="cursor:pointer"
                  width={22}
                  style={{color: "#37c"}}
                />
              </CustomButton>
            </div>
          </Show>


        </div>
        <div style={{
          'grid-template-columns':
            (!isLeftOpen() && !isRightOpen())
              ? 'repeat(1, 1fr)'
              : (isLeftOpen() && isRightOpen())
                ? 'repeat(3, 22% 53% 25%)'
                : `repeat(2, ${!isLeftOpen() ? '70% 30%' : '30% 70%'} )`,
        }} class={`grid gap:4px`}>

          <Show
            when={!isSmallScreen()}
            fallback={
              <Drawer
                customButton={() => false}
                drawerStyle={'padding: 10px'}
                open={isLeftOpen}
                setIsOpen={setIsLeftOpen}
                width="75%"
              >
                <MenuDragAndDrop

                  isLeftOpen={isLeftOpen}
                  toggleIsLeftOpen={setIsLeftOpen}
                  leftColumns={leftColumns}
                />
              </Drawer>
            }
          >
            <div class={`${!isLeftOpen() ? 'd:none' : 'd:contents'}`}>
              <MenuDragAndDrop
                isLeftOpen={isLeftOpen}
                toggleIsLeftOpen={setIsLeftOpen}
                leftColumns={leftColumns}
              />
            </div>
          </Show>
          <ContentDragAndDrop view={view}/>
          <Show
            when={!isSmallScreen()}
            fallback={
              <Drawer
                customButton={() => false}
                drawerStyle={'padding: 10px'}
                open={isRightOpen}
                setIsOpen={setIsRightOpen}
                width="75%"
              >
                <ActionsDragAndDrops
                  isRightOpen={isRightOpen}
                  toggleIsRightOpen={setIsRightOpen}
                  rightColumns={rightColumns}
                />
              </Drawer>
            }
          >
            <div class={`${!isRightOpen() ? "hidden" : "contents"}`}>
              <ActionsDragAndDrops
                isRightOpen={isRightOpen}
                toggleIsRightOpen={setIsRightOpen}
                rightColumns={rightColumns}
              />
            </div>
          </Show>
        </div>
      </div>
      <div classList={{'display:none': selectedSection() === 'build'}}>
        <PageSetting/>
      </div>
    </PageConfigContext.Provider>
  );
}
