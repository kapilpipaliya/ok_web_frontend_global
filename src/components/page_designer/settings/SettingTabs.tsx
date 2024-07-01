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

  const Tabs = () => <div class="bg:white position:sticky top:0">
    <div class="flex ai:center jc:space-between position:relative">
      <Icon
        class="bg:white:hover cursor:pointer position:absolute right:0 top:0"
        height={30}
        icon={"iconamoon:close-duotone"}
        onClick={() => setLayoutStore('isRightOpen', false)}
        style={{ color: "#c1c1c1" }}
        width={30} />
    </div>
    <div class="lh:1rem border-bottom-width:1px border-color:rgb(229,231,235) color:rgb(107,114,128)  f:0.875rem  font-weight:500  mb:10  text-align:center ">
      <ul class="flex  flex-wrap:wrap jc:space-around  margin-bottom:-1px ">
        <For each={tabs}>
          {(data) => (
            <li class="me-2 cursor:pointer">
              <button
                class="rounded-t-lg border-bottom-width:2.5px border-color:transparent display:inline-block p:10px"
                classList={{
                  "border-color:rgb(209,213,219):hover color:rgb(75,85,99):hover": selectedTab() !== data,
                  "font-weight:600 color:rgb(37,99,235) border-bottom-width:2.5px border-color:rgb(37,99,235)": selectedTab() === data
                }}
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
    <div class={"direction:ltr p:5"}>
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
