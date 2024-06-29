import { Icon } from "@iconify-icon/solid";
import { For, createSignal } from "solid-js";
import { LayoutPart } from "./LayoutPart";
import { FormConfig } from "./FormConfig";
import { capitalizeFirstLetter } from "~/lib/utils";
import { FormSetting } from "./FormSetting";
import { useDesignerLayoutStore } from "../LayoutContext";

export function SettingTabs() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [selectedTab, setSelectedTab] = createSignal("layout");

  return (
    <div class={"p:5 direction:ltr"}>
      <div class="position:sticky top:0 bg:white">
        <div class="flex ai:center jc:space-between position:relative">
          <Icon
            class="cursor:pointer bg:white:hover position:absolute top:0 right:0"
            onClick={() => setLayoutStore('isRightOpen', false)}
            icon={"iconamoon:close-duotone"}
            height={30}
            width={30}
            style={{ color: "#c1c1c1" }} />
        </div>
        <div class="f:0.875rem mb:10 lh:1rem font-weight:500  text-align:center  color:rgb(107,114,128)  border-bottom-width:1px  border-color:rgb(229,231,235) ">
          <ul class="jc:space-around  flex flex-wrap:wrap  margin-bottom:-1px ">
            <For each={layoutStore.rightMenuTabs}>
              {(data) => (
                <li class="me-2 cursor:pointer">
                  <a
                    onclick={() => setSelectedTab(data.id)}
                    class={`${selectedTab() === data.id
                      ? "font-weight:600 color:rgb(37,99,235) border-bottom-width:2.5px border-color:rgb(37,99,235)"
                      : "border-color:rgb(209,213,219):hover color:rgb(75,85,99):hover"} display:inline-block  p:10px border-bottom-width:2.5px  border-color:transparent  rounded-t-lg`}
                  >
                    {capitalizeFirstLetter(data.name)}
                  </a>
                </li>
              )}
            </For>
          </ul>
        </div>
      </div>

      <div classList={{ "display:none": selectedTab() !== "layout" }}>
        <LayoutPart />
      </div>
      <div
        classList={{ "display:none": selectedTab() !== "form" }}
        class="p:5"
      >
        <FormConfig />
      </div>
      <div
        classList={{ "display:none": selectedTab() !== "formSetting" }}
        class="p:5"
      >
        <FormSetting />
      </div>
    </div>
  );
}
