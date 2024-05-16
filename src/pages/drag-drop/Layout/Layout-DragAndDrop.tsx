import {
  Accessor,
  For,
  JSX,
  Match,
  Show,
  Switch,
  createSignal,
  useContext,
} from "solid-js";
import { HeaderDragAndDrop } from "./Header-DragAndDrop";
import PreviewSection from "../Preview";
import ShareSection from "../Share";
import { Tooltip } from "~/components/solid-blocks/blocks/tooltip/tooltip";
import { MenuDragAndDrop } from "./Menu/Menu-DragAndDrop";
import { Icon } from "@iconify-icon/solid";
import { IFormContext } from "~/lib/Utils";
import { createStore } from "solid-js/store";
import { PageConfigContext, PropertiesVertexIdContext } from "~/lib/contexts";
import { ContentDragAndDrop } from "./Content-DragAndDrop";
import { ActionsDragAndDrops } from "./Actions/Actions-DragAndDrops";
import { getNewGraphId } from "~/lib/graph/transaction";

const LayoutDragAndDrop = (): JSX.Element => {
  const [isLeftOpen, toggleIsLeftOpen] = useExpansion(true);
  const [isRightOpen, toggleIsRightOpen] = useExpansion(true);
  const [selectedStepId, setSelectedStepId] = createSignal(1); // Initially set to the first step
  const [leftColumns, setLeftColumns] = createSignal(
    ["components", "pages", "collection"].map((column) => ({
      id: column,
      name: column,
    })),
  );
  const [steps, setSteps] = createSignal([
    { id: 1, name: "Job details", href: "#", status: "current", active: true },
    {
      id: 2,
      name: "Application form",
      href: "#",
      status: "upcoming",
      active: false,
    },
    { id: 3, name: "Preview", href: "#", status: "upcoming", active: false },
  ]);
  const [rightColumns, setRightColumns] = createSignal(
    ["layout", "properties", "form"].map((column) => ({
      id: column,
      name: column,
    })),
  );

  const onChangeStep = (selectedStepId: number) => {
    const newSteps = steps().map((step) => {
      return {
        ...step,
        status:
          step.id < selectedStepId
            ? "complete"
            : step.id === selectedStepId
              ? "current"
              : "upcoming",
        active: step.id === selectedStepId,
      };
    });
    setSelectedStepId(selectedStepId);
    setSteps(newSteps);
  };
  const getStepId = () => {
    return steps()
      .map((step) => (step.active ? step.id : null))
      .find((id) => id !== null)!;
  };

  function useExpansion(defaultValue = true) {
    const [expanded, setExpanded] = createSignal(defaultValue);
    const toggleExpansion = () => setExpanded(!expanded());
    return [expanded, toggleExpansion];
  }

  return (
    <PropertiesVertexIdContext.Provider value={getNewGraphId()}>
      <PageConfigContext.Provider
        value={createStore({} as { formData: IFormContext })}
      >
        <Switch>
          <Match when={selectedStepId() === 1}>
            <div
              style={{
                display: "grid",
                "grid-template-areas": `'menu header callToAction' 'menu content callToAction'`,
                "grid-auto-rows": "auto 1fr auto",
                height: "90vh",
                "grid-template-columns": `${isLeftOpen() ? "15%" : "30px"} 1fr ${isRightOpen() ? "21%" : "30px"}`,
              }}
            >
              <HeaderDragAndDrop
                NavigationBar={NavigationBar}
                steps={steps}
                getStepId={getStepId}
                onChangeStep={onChangeStep}
              />
              <MenuDragAndDrop
                isLeftOpen={isLeftOpen}
                isRightOpen={isRightOpen}
                toggleIsLeftOpen={toggleIsLeftOpen}
                toggleIsRightOpen={toggleIsRightOpen}
                leftColumns={leftColumns}
                rightColumns={rightColumns}
              />
              <ContentDragAndDrop />
              <ActionsDragAndDrops
                isLeftOpen={isLeftOpen}
                isRightOpen={isRightOpen}
                toggleIsLeftOpen={toggleIsLeftOpen}
                toggleIsRightOpen={toggleIsRightOpen}
                leftColumns={leftColumns}
                rightColumns={rightColumns}
              />
            </div>
          </Match>
          <Match when={selectedStepId() === 2}>
            <div
              class={
                "w:100% h:50px display:flex align-items:center mb:10 justify-content:center"
              }
            >
              <NavigationBar
                steps={steps}
                getStepId={getStepId}
                onChangeStep={onChangeStep}
              />
            </div>
            <PreviewSection />
          </Match>
          <Match when={selectedStepId() === 3}>
            <div
              class={
                "w:100% h:50px display:flex align-items:center mb:10 justify-content:center"
              }
            >
              <NavigationBar
                steps={steps}
                getStepId={getStepId}
                onChangeStep={onChangeStep}
              />
            </div>
            <ShareSection />
          </Match>
        </Switch>
      </PageConfigContext.Provider>
    </PropertiesVertexIdContext.Provider>
  );
};

export default LayoutDragAndDrop;

const NavigationBar = ({
  steps,
  getStepId,
  onChangeStep,
}: {
  steps: Accessor<
    {
      id: number;
      name: string;
      href: string;
      status: string;
      active: boolean;
    }[]
  >;
  getStepId: () => number;
  onChangeStep: (selectedStepId: number) => void;
}) => (
  <nav aria-label="Progress">
    <ol role="list" class="flex align-items:center">
      <For each={steps()}>
        {(step) => (
          <li
            class={`position:relative pr:${step.id !== 3 ? "2rem" : ""} pr:${step.id !== 3 ? "5rem@sm" : ""}`}
          >
            {/* Completed Step */}
            <div
              class="position:absolute inset:0px flex align-items:center "
              aria-hidden="true"
            >
              <Show when={step.id !== 3}>
                <div
                  class={`h:0.125rem width:100% bg:${step.id < getStepId()! ? "rgb(79,70,229)" : "rgb(229,231,235)"}`}
                />
              </Show>
            </div>
            <Tooltip
              position={"n"}
              content={
                step.id === 1
                  ? "Edit Page"
                  : step.id === 2
                    ? "Preview"
                    : "Share"
              }
            >
              <a
                href="#"
                onClick={() => onChangeStep(step.id)}
                class={`position:relative b:1px|solid|${step.status === "current" ? "rgb(79,70,229)" : "rgb(229,231,235)"} flex h:2rem w:2rem align-items:center justify-content:center  border-radius:9999px  bg:${step.id >= getStepId() ? "#ffffff" : "rgb(85,79,220)"}`}
              >
                <Icon
                  icon={
                    step.id === 1
                      ? "material-symbols-light:edit-calendar-outline-rounded"
                      : step.id === 2
                        ? "solar:eye-broken"
                        : "grommet-icons:share-rounded"
                  }
                  style={{ color: step.id < getStepId()! ? "white" : "black" }}
                />
                <span class="sr-only">Step {step.id}</span>
              </a>
            </Tooltip>
          </li>
        )}
      </For>
    </ol>
  </nav>
);
