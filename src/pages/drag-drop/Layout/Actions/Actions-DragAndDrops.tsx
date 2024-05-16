import { Icon } from "@iconify-icon/solid";
import { useContext, Show, For, Accessor, Match, Switch } from "solid-js";
import { PageConfigContext, SelectedIdContext } from "~/lib/contexts";
import { Vertex } from "~/lib/graph/graph";
import { useExpansion } from "../CommonCompUtils";
import { LayoutPart } from "./LayoutPart";
import { FormConfig } from "./FormConfig";
import { Properties } from "./Properties";
interface ActionsProps {
  leftColumns: any;
  rightColumns: any;
  isLeftOpen: Accessor<boolean>;
  isRightOpen: Accessor<boolean>;
  toggleIsLeftOpen: Accessor<boolean>;
  toggleIsRightOpen: Accessor<boolean>;
}
export const ActionsDragAndDrops = (props: ActionsProps) => {
  const [pageConfig, setPageConfig] = useContext(PageConfigContext);

  return (
    <aside style={{ "grid-area": "callToAction" }}>
      <div class="rel z-index:1 top:40vh right:10px mr:10px">
        <button
          onClick={props.toggleIsRightOpen}
          type="button"
          title={`${props.isRightOpen() ? "Close" : "Open"}`}
          class="absolute top-1/2 right-1/2 transform translate-x-50 -translate-y-50 h:29 bg:white border-radius:9999px"
          style={`background-color:white;style=z-index: 1;position: absolute;margin-top: 20%;`}
        >
          <Show
            when={props.isRightOpen()}
            fallback={
              <Icon
                icon={"line-md:chevron-left-circle"}
                height={30}
                width={30}
                style={{ color: "#c1c1c1" }}
              />
            }
          >
            <Icon
              icon={"line-md:chevron-right-circle"}
              height={30}
              width={30}
              style={{ color: "#c1c1c1" }}
            />
          </Show>
        </button>
      </div>
      <div
        class={`h:100vh flex-col overflow-x:auto border:1|solid|lightgrey m:5 r:5|5|5|5`}
        style={{
          "max-height": "calc(100vh - 100px)",
          "scrollbar-width": "thin",
          "scrollbar-color": "lightgrey",
        }}
      >
        <Show when={props.isRightOpen()}>
          <For each={props.rightColumns()}>
            {(column, index) => (
              <Column
                type={column.id}
                index={index()}
                vertex={pageConfig.formData.formData}
              />
            )}
          </For>
        </Show>
      </div>
    </aside>
  );
};

const Column = (props: { type: string; index: number; vertex: Vertex }) => {
  const [isFormOpen, toggleIsFormOpen] = useExpansion(true);
  const [isLayoutOpen, toggleIsLayoutOpen] = useExpansion(true);
  const [isLayoutExpanded, toggleLayoutExpansion] = useExpansion();
  const [isPropertiesExpanded, togglePropertiesExpansion] = useExpansion();
  const [isFormExpanded, toggleFormExpansion] = useExpansion();
  const [selectedId, setSelectedId] = useContext(SelectedIdContext);
  const [pageConfig, setPageConfig] = useContext(PageConfigContext);

  return (
    <>
      <Show when={props.index > 0} fallback={<div />}>
        <Show
          when={props.type === "properties" && selectedId() === -1}
          fallback={<hr class="color:#ccc mt:5 mb:5" />}
        >
          <div />
        </Show>
      </Show>
      <div class={"p:5 direction:ltr"}>
        <Switch>
          <Match when={props.type === "layout"}>
            <Show
              when={isLayoutExpanded()}
              fallback={
                <div
                  class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px w:2rem p:5px bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
                  style="transition: opacity 0.3s ease-in-out;"
                  onClick={toggleLayoutExpansion}
                  title="Layout"
                >
                  <Icon icon={"tabler:layout"} height={25} width={25} />
                </div>
              }
            >
              <div class="m:5">
                <div
                  onClick={toggleIsLayoutOpen}
                  style={{
                    display: "flex",
                    "justify-content": "space-between",
                    "align-items": "center",
                    cursor: "pointer",
                  }}
                >
                  <div
                    class="mb:2px ml:5px"
                    style="flex-grow: 1; font-weight: bold"
                  >
                    Layers
                  </div>
                  <div style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out">
                    <Icon
                      icon={"mdi:chevron-up"}
                      style={{
                        "font-size": "24px",
                        "border-radius": "50%",
                        "margin-left": "5px",
                        transition: "transform 0.2s linear",
                        transform: `${
                          isLayoutOpen() ? "rotate(0deg)" : "rotate(180deg)"
                        }`,
                      }}
                      class="flex-1"
                    />
                  </div>
                </div>

                <Show when={isLayoutOpen()}>
                  <hr class={"color:lightgrey m:.4rem|0"} />
                  <LayoutPart vertex={props.vertex} />
                </Show>
              </div>
            </Show>
          </Match>
          <Match
            when={
              props.type === "properties" &&
              selectedId() !== -1 &&
              pageConfig.formData
            }
          >
            <Properties vertex={props.vertex} />
          </Match>
          <Match when={props.type === "form"}>
            <Show
              when={isFormExpanded()}
              fallback={
                <div
                  class="b:1|solid|rgb(37,99,253) cursor-pointer m:10px w:2rem p:5px bg:rgb(232,229,229):hover r:5|5|5|5 h:36px"
                  style="transition: opacity 0.3s ease-in-out;"
                  onClick={toggleFormExpansion}
                  title="Form"
                >
                  <Icon
                    icon={"fluent:form-multiple-24-regular"}
                    height={25}
                    width={25}
                  />
                </div>
              }
            >
              <div class="m:5">
                <div
                  class={`mb:${isFormOpen() ? "10px" : "0px"}`}
                  onClick={toggleIsFormOpen}
                  style={{
                    display: "flex",
                    "justify-content": "space-between",
                    "align-items": "center",
                    cursor: "pointer",
                  }}
                >
                  <div
                    class="mb:2px ml:5px"
                    style="flex-grow: 1; font-weight: bold"
                  >
                    Form Configuration
                  </div>
                  <div style="display: flex; align-items: center; transition:margin-left|5000ms|ease-in-out">
                    <Icon
                      icon={"mdi:chevron-up"}
                      style={{
                        "font-size": "24px",
                        "border-radius": "50%",
                        "margin-left": "5px",
                        transition: "transform 0.2s linear",
                        transform: `${
                          isFormOpen() ? "rotate(0deg)" : "rotate(180deg)"
                        }`,
                      }}
                      class="flex-1"
                    />
                  </div>
                </div>
                <Show when={isFormOpen()}>
                  <hr class={"color:lightgrey m:.4rem|0"} />
                  <FormConfig />
                </Show>
              </div>
            </Show>
          </Match>
        </Switch>
      </div>
    </>
  );
};
