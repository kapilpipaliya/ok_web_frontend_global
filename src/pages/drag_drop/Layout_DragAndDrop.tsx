import { type JSX, Show, createSignal, onCleanup, onMount, For } from "solid-js";
import { HeaderDragAndDrop } from "./Header_DragAndDrop";
import { MenuDragAndDrop } from "~/pages/drag_drop/menu/Menu_DragAndDrop";
import { Icon } from "@iconify-icon/solid";
import { createStore } from "solid-js/store";
import {
  type IFormContext,
  PageConfigContext,

} from "~/lib/contexts";
import { ContentDragAndDrop } from "./Content_DragAndDrop";
import { ActionsDragAndDrops } from "~/pages/drag_drop/actions/Actions_DragAndDrops";
import CustomButton from "~/components/solid_blocks/button/buttons";
import { useExpansion } from "./CommonCompUtils";
import { PageSetting } from "./PageSetting";
import { Tooltip } from "~/components/solid_blocks";
import Drawer from "~/components/Drawer";
import { isServer } from "solid-js/web";

const LayoutDragAndDrop = (): JSX.Element => {
  const [view, setView] = createSignal("Tablet");
  const [isLeftOpen, toggleIsLeftOpen] = useExpansion(true);
  const [isRightOpen, toggleIsRightOpen] = useExpansion(true);
  const [selectedSection, setSelectedSection] = createSignal("build");
  const [isSmallScreen, setIsSmallScreen] = createSignal(false);
  const [leftColumns, setLeftColumns] = createSignal(
    ["components", "pages", "templates"].map((column) => ({
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
    setIsSmallScreen(window.innerWidth < 640);
    if (window.innerWidth < 640) {
      toggleIsLeftOpen();
      toggleIsRightOpen();
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
          <div class="b:1px|solid|lightgrey bg:white color:#000:hover color:grey flex ai:center jc:center r:7 h:30px w:30px cursor:pointer">
            <Icon icon={"ci:arrow-undo-up-left"} height={22} width={22} />
          </div>
        </Tooltip>
        <Tooltip content={"Redo"} position={"n"}>
          <div class="b:1px|solid|lightgrey color:#000:hover color:grey bg:white flex ai:center jc:center r:7 h:30px w:30px cursor:pointer">
            <Icon icon={"ci:arrow-undo-up-right"} height={22} width={22} />
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
      <div class={`grid ${(isLeftOpen() && isRightOpen())
        ? 'grid-cols:1'
        : (!isLeftOpen() && !isRightOpen())
          ? 'grid-cols:3'
          : 'grid-cols:2'} gap:4px`}>
        <Show when={!isLeftOpen()}>
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
              onClick={toggleIsLeftOpen}
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
            </CustomButton>
          </div>
        </Show>
        <div class="ai:center flex gap:5 p:10 jc:center">
          <UndoRedoIcons/>
          <Stepper />
        </div>

        <Show when={!isRightOpen()} >
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
              onClick={toggleIsRightOpen}
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
            </CustomButton>
          </div>
        </Show>


      </div>
      <div style={{
        'grid-template-columns':
          (!isLeftOpen() && !isRightOpen())
            ? 'repeat(1, 1fr)'
            : (isLeftOpen() && isRightOpen())
              ? 'repeat(3, 25% 50% 25%)'
              : `repeat(2, ${!isLeftOpen() ? '70% 30%' : '30% 70%'} )`,
      }} class={`grid gap:4px`}>

        <Show
          when={!isSmallScreen()}
          fallback={
            <Drawer
              customButton={false}
              drawerStyle={'padding: 10px'}
              open={isLeftOpen}
              setIsOpen={toggleIsLeftOpen}
              width="75%"
            >
              <MenuDragAndDrop
            
                isLeftOpen={isLeftOpen}
                toggleIsLeftOpen={toggleIsLeftOpen}
                leftColumns={leftColumns}
              />
            </Drawer>
          }
        >
          <div class={`${!isLeftOpen() ? 'd:none' : 'd:contents'}`}>
          <MenuDragAndDrop
            isLeftOpen={isLeftOpen}
            toggleIsLeftOpen={toggleIsLeftOpen}
            leftColumns={leftColumns}
          />
        </div>
        </Show>
        <ContentDragAndDrop view={view} />
        <Show
          when={!isSmallScreen()}
          fallback={
            <Drawer
              customButton={()=>false}
              drawerStyle={'padding: 10px'}
              open={isRightOpen}
              setIsOpen={toggleIsRightOpen}
              width="75%"
            >
              <ActionsDragAndDrops
                isRightOpen={isRightOpen}
                toggleIsRightOpen={toggleIsRightOpen}
                rightColumns={rightColumns}
              />
            </Drawer>
          }
        >
          <div class={`${!isRightOpen() ? "hidden" : "contents"}`}>
            <ActionsDragAndDrops
              isRightOpen={isRightOpen}
              toggleIsRightOpen={toggleIsRightOpen}
              rightColumns={rightColumns}
            />
          </div>
        </Show>
      </div>
    </PageConfigContext.Provider>
  );
};

export default LayoutDragAndDrop;

const Stepper = () => {
  const [steps, setSteps] = createSignal([
    { id: 1, label: "Personal Info", icon: "1" },
    { id: 2, label: "Account Info", icon: "2" },
    { id: 3, label: "Review", icon: "3" },
  ]);
  const [currentStep, setCurrentStep] = createSignal(1);

  const updateIndices = (newSteps: any) => {
    return newSteps.map((step: any, index: any) => ({
      ...step,
      id: index + 1,
      label: `Step ${index + 1}`,
      icon: `${index + 1}`
    }));
  };

  const addStepBefore = (id: any) => {
    const newStepId = steps().length + 1;
    const newSteps: any = [];
    steps().forEach(step => {
      if (step.id === id) {
        newSteps.push({ id: newStepId, label: `Step ${newStepId}`, icon: `${newStepId}` });
      }
      newSteps.push(step);
    });
    setSteps(updateIndices(newSteps));
  };

  const addStepAfter = (id: any) => {
    const newStepId = steps().length + 1;
    const newSteps: any = [];
    steps().forEach(step => {
      newSteps.push(step);
      if (step.id === id) {
        newSteps.push({ id: newStepId, label: `Step ${newStepId}`, icon: `${newStepId}` });
      }
    });
    setSteps(updateIndices(newSteps));
  };

  const deleteStep = (id: any) => {
    const newSteps: any = steps().filter(step => step.id !== id);
    setSteps(updateIndices(newSteps));
    if (currentStep() === id) {
      setCurrentStep(newSteps.length > 0 ? newSteps[0].id : null);
    }
  };

  return (
    <>
      <ul style="position:relative; display:flex; flex-direction:row; gap:0.5rem; padding:0.75rem; flex-wrap:wrap" class="w:50%@>md w:100% m:0|10">
        <For each={steps()}>
          {(step, index) => (
            <>
              <Icon
                style="cursor:pointer; color:rgb(37,99,235);padding: 5px 0px;"
                icon="mdi:plus"
                height={20}
                width={20}
                onClick={(e) => {
                  e.stopPropagation();
                  addStepBefore(step.id);
                }}
              />
              <li
                style={`display:flex; align-items:center; gap:0.5rem; flex-shrink:1; flex-basis:0; flex-grow:1; cursor:pointer; ${currentStep() === step.id ? "color:rgb(37,99,235);" : ""
                  } position:relative;`}
                onClick={() => setCurrentStep(step.id)}
              >
                <span style="display:flex; align-items:center;">
                  <Tooltip content={step.label}>
                    <span
                      style={`min-width:1.75rem; min-height:1.75rem; width:1.75rem; height:1.75rem; display:flex; justify-content:center; align-items:center; flex-shrink:0; background-color:rgb(243,244,246); font-weight:500; color:rgb(31,41,55); border-radius:9999px; ${currentStep() === step.id ? "background-color:rgb(37,99,235); color:white;" : ""
                        }`}
                    >
                      {currentStep() === step.id ? (
                        <svg
                          style="width:0.75rem; height:0.75rem;"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="3"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : (
                        step.icon
                      )}
                    </span>
                  </Tooltip>
                </span>
                <div style="width:100%; height:1px; flex-grow:1; background-color:rgb(229,231,235);"></div>
                <button
                  style="margin-left:0.5rem; color:red; background:none; border:none; cursor:pointer;"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteStep(step.id);
                  }}
                >
                  &times;
                </button>
                <span style="position:absolute; top:100%; left:50%; transform:translateX(-50%); display:none; padding:0.5rem; background:rgba(0, 0, 0, 0.75); color:white; border-radius:0.25rem; font-size:0.75rem; white-space:nowrap; pointer-events:none;">
                  {step.label}
                </span>
              </li>
              <Icon
                style={`padding:5px 0px;cursor:pointer; color:rgb(37,99,235); ${index() === steps().length - 1 ? "" : "display:none;"}`}
                icon="mdi:plus"
                height={20}
                width={20}
                onClick={(e) => {
                  e.stopPropagation();
                  addStepAfter(step.id);
                }}
              />
            </>
          )}
        </For>
      </ul>
    </>
  );
};

