import { type JSX, Show, createSignal } from "solid-js";
import { HeaderDragAndDrop } from "./Header_DragAndDrop";
import { MenuDragAndDrop } from "~/pages/drag_drop/layout/menu/Menu_DragAndDrop";
import { Icon } from "@iconify-icon/solid";
import { createStore } from "solid-js/store";
import {
 IFormContext,
 PageConfigContext,
 PropertiesVertexIdContext
} from "~/lib/contexts";
import { ContentDragAndDrop } from "./Content_DragAndDrop";
import { ActionsDragAndDrops } from "~/pages/drag_drop/layout/actions/Actions_DragAndDrops";
import { getNewGraphId } from "~/lib/graph/transaction";
import CustomButton from "~/components/solid_blocks/button/buttons";
import { useExpansion } from "./CommonCompUtils";
import { PageSetting } from "./PageSetting";

const LayoutDragAndDrop = (): JSX.Element => {
  const [view, setView] = createSignal("Tablet");
  const [isLeftOpen, toggleIsLeftOpen] = useExpansion(true);
  const [isRightOpen, toggleIsRightOpen] = useExpansion(true);
  const [selectedSection, setSelectedSection] = createSignal("build");
  const [leftColumns, setLeftColumns] = createSignal(
    ["components", "pages", "collection"].map((column) => ({
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

  const gridArea = () => ({
    display: "grid",
    "grid-template-areas": isLeftOpen()
      ? isRightOpen()
        ? `'header header header' 'menu content callToAction'`
        : `'menu header callToAction' 'menu content content'`
      : isRightOpen()
        ? `'menu header header' 'content content callToAction'`
        : `'menu header callToAction' 'content content content'`,
    "grid-template-columns": isLeftOpen()
      ? isRightOpen()
        ? ""
        : "17% 1fr"
      : isRightOpen()
        ? "25%"
        : "12% 1fr",
  });

  return (
    <PropertiesVertexIdContext.Provider value={createSignal(getNewGraphId())}>
      <PageConfigContext.Provider
        value={createStore({} as { formData: IFormContext })}
      >
        <div style={gridArea()}>
          <HeaderDragAndDrop
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            view={view}
            setView={setView}
          />
          <Show when={selectedSection() === "build"}>
            <Show
              when={isLeftOpen()}
              fallback={
                <div
                  class={`rel h:50px ${
                    !isLeftOpen() ? "left:-1rem" : ""
                  } r:0|15|15|0 p:2 cursor:pointer`}
                >
                  <CustomButton
                    style={{
                      cursor: "pointer",
                      padding: "15px",
                      borderRadius: "0px 15px 15px 0px",
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                    variant="soft"
                    onClick={toggleIsLeftOpen}
                    class="outline:2px|solid|transparent outline:offset|2px:focus"
                  >
                    <Icon
                      icon={"solar:widget-add-outline"}
                      height={22}
                      class="ml:10 cursor:pointer"
                      width={22}
                      style={{ color: "#37c" }}
                    />
                    <span class="font:14 cursor:pointer">Add Form Element</span>
                  </CustomButton>
                </div>
              }
            >
              <MenuDragAndDrop
                isLeftOpen={isLeftOpen}
                toggleIsLeftOpen={toggleIsLeftOpen}
                leftColumns={leftColumns}
              />
            </Show>
            <ContentDragAndDrop view={view} />
            <Show when={!isRightOpen()}>
              <div
                class={`rel h:50px ${
                  !isRightOpen() ? "right:-1rem" : ""
                } r:0|15|15|0 p:2 cursor:pointer`}
              >
                <CustomButton
                  style={{
                    cursor: "pointer",
                    padding: "15px",
                    borderRadius: "0px 15px 15px 0px",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                  variant="soft"
                  onClick={toggleIsRightOpen}
                  class="p:15 jc:center outline:2px|solid|transparent outline:offset|2px:focus"
                >
                  <span class="font:14 cursor:pointer">View Form Settings</span>
                  <Icon
                    icon={"icon-park-outline:setting-two"}
                    height={22}
                    class="ml:10 cursor:pointer"
                    width={22}
                    style={{ color: "#37c" }}
                  />
                </CustomButton>
              </div>
            </Show>
            <ActionsDragAndDrops
              isRightOpen={isRightOpen}
              toggleIsRightOpen={toggleIsRightOpen}
              rightColumns={rightColumns}
            />
          </Show>
          <Show when={selectedSection() === "setting"}>
            <PageSetting />
          </Show>
        </div>
      </PageConfigContext.Provider>
    </PropertiesVertexIdContext.Provider>
  );
};

export default LayoutDragAndDrop;
