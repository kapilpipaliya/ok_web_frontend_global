import { Icon } from "@iconify-icon/solid";
import { For, createSignal } from "solid-js";

import { capitalizeFirstLetter } from "~/lib/utils";

import { useDesignerLayoutStore } from "../LayoutContext";
import { FormConfig } from "./FormConfig";
import { LayoutTree } from "./LayoutTree";

export function SettingTabs() {
  const [_, setLayoutStore] = useDesignerLayoutStore();
  const [selectedTab, setSelectedTab] = createSignal("layout");
  const tabs = ["layout", "form"];

  const Tabs = () => <div class="position:sticky top:0 bg:white">
    <div class="flex ai:center jc:space-between position:relative">
      <Icon
        class="cursor:pointer bg:white:hover position:absolute top:0 right:0"
        height={30}
        icon={"iconamoon:close-duotone"}
        onClick={() => setLayoutStore('isRightOpen', false)}
        style={{ color: "#c1c1c1" }}
        width={30} />
    </div>
    <div class="f:0.875rem mb:10 lh:1rem font-weight:500  text-align:center  color:rgb(107,114,128)  border-bottom-width:1px  border-color:rgb(229,231,235) ">
      <ul class="jc:space-around  flex flex-wrap:wrap  margin-bottom:-1px ">
        <For each={tabs}>
          {(data) => (
            <li class="me-2 cursor:pointer">
              <button
                class={`${selectedTab() === data
                  ? "font-weight:600 color:rgb(37,99,235) border-bottom-width:2.5px border-color:rgb(37,99,235)"
                  : "border-color:rgb(209,213,219):hover color:rgb(75,85,99):hover"} display:inline-block  p:10px border-bottom-width:2.5px  border-color:transparent  rounded-t-lg`}
                onclick={() => setSelectedTab(data)}
                type="button"
              >
                {capitalizeFirstLetter(data)}
              </button>
            </li>
          )}
        </For>
      </ul>
    </div>
  </div>

  return (
    <div class={"p:5 direction:ltr"}>
      <Tabs />

      <div classList={{ "display:none": selectedTab() !== "layout" }}>
        <LayoutTree />
      </div>
      <div
        class="p:5"
        classList={{ "display:none": selectedTab() !== "form" }}
      >
        <FormConfig />
      </div>
    </div>
  );
}
