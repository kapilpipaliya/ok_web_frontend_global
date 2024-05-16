import { Icon } from "@iconify-icon/solid";
import { Show, For, Accessor, Match, Switch, useContext } from "solid-js";
import { PageConfigContext } from "~/lib/contexts";
import { Vertex } from "~/lib/graph/graph";
import { useExpansion } from "../CommonCompUtils";
import { ComponentPart } from "./ComponentPart";
import { PagesPart } from "./PagesPart";
import { CollectionPart } from "./CollectionPart";

interface MenuProps {
  leftColumns: any;
  rightColumns: any;
  isLeftOpen: Accessor<boolean>;
  isRightOpen: Accessor<boolean>;
  toggleIsLeftOpen: Accessor<boolean>;
  toggleIsRightOpen: Accessor<boolean>;
}

export const MenuDragAndDrop = (props: MenuProps) => {
  const [pageConfig, setPageConfig] = useContext(PageConfigContext);
  return (
    <nav style={{ "grid-area": "menu" }}>
      <div class={"rel"}>
        <div
          class={`h:100vh  flex-col overflow:auto border:1|solid|lightgrey m:5 r:5|5|5|5 direction:rtl`}
          style={{
            "max-height": "calc(100vh - 100px)",
            "scrollbar-width": "thin",
            "scrollbar-color": "lightgrey",
          }}
        >
          <Show when={props.isLeftOpen()}>
            <For each={props.leftColumns()}>
              {(column, index) => (
                <Column
                  type={column.id}
                  index={index()}
                  vertex={pageConfig.formData?.formData}
                />
              )}
            </For>
          </Show>
        </div>
        <div class={`abs z-index:1 top:40vh right:17px`}>
          <button
            onClick={props.toggleIsLeftOpen}
            type="button"
            title={`${props.isLeftOpen() ? "Close" : "Open"}`}
            class="top-1/2 right-1/2 transform translate-x-50 -translate-y-50 h:29 bg:white border-radius:9999px"
            style={`background-color:white;style=z-index: 1;position: absolute;margin-top: 20%;`}
          >
            <Show
              when={props.isLeftOpen()}
              fallback={
                <Icon
                  icon={"line-md:chevron-right-circle"}
                  height={30}
                  width={30}
                  style={{ color: "#c1c1c1" }}
                />
              }
            >
              <Icon
                icon={"line-md:chevron-left-circle"}
                height={30}
                width={30}
                style={{ color: "#c1c1c1" }}
              />
            </Show>
          </button>
        </div>
      </div>
    </nav>
  );
};

const Column = (props: { type: string; index: number; vertex: Vertex }) => {
  const [isComponentsExpanded, toggleComponentsExpansion] = useExpansion();
  const [isPagesExpanded, togglePagesExpansion] = useExpansion();
  const [isCollectionExpanded, toggleCollectionExpansion] = useExpansion();
  const [isComponentOpen, toggleComponentOpen] = useExpansion(true);
  const [isPagesOpen, togglePagesOpen] = useExpansion(true);
  const [isCollFieldsOpen, toggleCollFieldsOpen] = useExpansion(true);

  return (
    <>
      <div class={"p:5 direction:ltr"}>
        <Switch>
          <Match when={props.type === "components"}>
            <Show
              when={isComponentsExpanded()}
              fallback={
                <div
                  class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px p:5px w:2rem bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
                  style="transition: opacity 0.3s ease-in-out;"
                  onClick={toggleComponentsExpansion}
                  title="Components"
                >
                  <Icon icon={"mynaui:components"} height={25} width={25} />
                </div>
              }
            >
              <div class="m:5">
                <div
                  class="mb:10px"
                  onClick={toggleComponentOpen}
                  style={{
                    display: "flex",
                    "justify-content": "space-between",
                    "align-items": "center",
                    cursor: "pointer",
                  }}
                >
                  <div style="font-weight: bold">Components</div>
                  <div style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out">
                    <Icon
                      icon={"mdi:chevron-up"}
                      style={{
                        "font-size": "24px",
                        "border-radius": "50%",
                        "margin-left": "5px",
                        transition: "transform 0.2s linear",
                        transform: `${
                          isComponentOpen() ? "rotate(0deg)" : "rotate(180deg)"
                        }`,
                      }}
                      class="flex-1"
                    />
                  </div>
                  {/*<div class="bg:rgb(255,253,253) bg:rgb(232,229,229):hover r:5|5|5|5 h:26px"
                                             title="Close Components">
                                            {isComponentsExpanded() && (
                                                <div
                                                    onClick={toggleComponentsExpansion}
                                                    class="cursor:pointer"
                                                >
                                                    <Icon
                                                        icon={"mingcute:left-line"}
                                                        height={25}
                                                        width={25}
                                                    />
                                                </div>
                                            )}
                                        </div>*/}
                </div>

                <Show when={isComponentOpen()}>
                  <hr class={"color:lightgrey m:.4rem|0"} />
                  <ComponentPart />
                </Show>
              </div>
            </Show>
          </Match>
          <Match when={props.type === "pages"}>
            <Show
              when={isPagesExpanded()}
              fallback={
                <div
                  class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px p:5px w:2rem bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
                  style="transition: opacity 0.3s ease-in-out;"
                  onClick={togglePagesExpansion}
                  title="Pages"
                >
                  <Icon
                    icon={"iconoir:multiple-pages"}
                    height={25}
                    width={25}
                  />
                </div>
              }
            >
              <div class="m:5 ">
                <div
                  class="mb:10px"
                  onClick={togglePagesOpen}
                  style={{
                    display: "flex",
                    "justify-content": "space-between",
                    "align-items": "center",
                    cursor: "pointer",
                  }}
                >
                  <div style="font-weight: bold">Pages</div>

                  <div style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out">
                    <Icon
                      icon={"mdi:chevron-up"}
                      style={{
                        "font-size": "24px",
                        "border-radius": "50%",
                        "margin-left": "5px",
                        transition: "transform 0.2s linear",
                        transform: `${
                          isPagesOpen() ? "rotate(0deg)" : "rotate(180deg)"
                        }`,
                      }}
                      class="flex-1"
                    />
                  </div>
                </div>
                <Show when={isPagesOpen()}>
                  <hr class={"color:lightgrey m:.4rem|0"} />
                  <PagesPart />
                </Show>
              </div>
            </Show>
          </Match>
          <Match when={props.type === "collection"}>
            <Show
              when={isCollectionExpanded()}
              fallback={
                <div
                  class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px w:2rem p:5px bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
                  style="transition: opacity 0.3s ease-in-out;"
                  onClick={toggleCollectionExpansion}
                  title="Collection"
                >
                  <Icon
                    icon={"fluent:collections-24-regular"}
                    height={25}
                    width={25}
                  />
                </div>
              }
            >
              <div class="m:5">
                <div
                  class="mb:10px"
                  onClick={toggleCollFieldsOpen}
                  style={{
                    display: "flex",
                    "justify-content": "space-between",
                    "align-items": "center",
                    cursor: "pointer",
                  }}
                >
                  <div style="font-weight: bold">Collection Fields</div>
                  <div style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out">
                    <Icon
                      icon={"mdi:chevron-up"}
                      style={{
                        "font-size": "24px",
                        "border-radius": "50%",
                        "margin-left": "5px",
                        transition: "transform 0.2s linear",
                        transform: `${
                          isCollFieldsOpen() ? "rotate(0deg)" : "rotate(180deg)"
                        }`,
                      }}
                      class="flex-1"
                    />
                  </div>
                </div>
                <Show when={isCollFieldsOpen()}>
                  <hr class={"color:lightgrey m:.4rem|0"} />
                  <CollectionPart />
                </Show>
              </div>
            </Show>
          </Match>
        </Switch>
      </div>
    </>
  );
};
