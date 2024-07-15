import { Icon } from "@iconify-icon/solid";
import { For, Show, createMemo, createSignal } from "solid-js";

import { capitalizeFirstLetter } from "~/lib/utils";

import { useDesignerLayoutStore } from "../LayoutContext";
import { FormConfig } from "./form/FormConfig";
import { NameKey } from "./keys/NameKey";
import { PrimaryKey } from "./keys/PrimaryKey";
import { LayoutTree } from "./layout/LayoutTree";
import { Rules } from "./rules/Rules";
import { SeoConfig } from "./seo/SeoConfig";
import { UniqueConstrains } from "./unique_constrains/UniqueConstrains";

export function SettingTabs() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [selectedTab, setSelectedTab] = createSignal("layout");

  const tabs = createMemo(() => {
    const baseTabs = ["layout", "form"];
    if (layoutStore.formData?.formData?.L[0] === "Form") {
      baseTabs.push("Keys", "Unique constrains");
    }
    if (layoutStore.formData?.formData?.L[0] === "Form" || layoutStore.formData?.formData?.L[0] === "Page") {
      baseTabs.push("Rules", "SEO");
    }
    return baseTabs;
  });

  const Tabs = () => (
    <div class="bg:white position:sticky top:0">

        <Icon
          class="bg:white:hover color:#c1c1c1 cursor:pointer position:absolute right:0 top:0"
          height={30}
          icon={"iconamoon:close-duotone"}
          onClick={() => setLayoutStore("isRightOpen", false)}
          width={30}
        />
  
      <div class="lh:1rem border-bottom-width:1px border-color:rgb(229,231,235) color:rgb(107,114,128)  f:0.875rem  font-weight:500  mb:10  text-align:center ">
        <ul class="overflow-x-auto scrollbar-width:thin flex jc:space-around  margin-bottom:-1px ">
          <For each={tabs()}>
            {(data) => (
              <li class="me-2 cursor:pointer">
                <button
                  class="rounded-t-lg border-bottom-width:2.5px border-color:transparent display:inline-block p:10px"
                  classList={{
                    "border-color:rgb(209,213,219):hover color:rgb(75,85,99):hover":
                      selectedTab() !== data,
                    "font-weight:600 color:rgb(37,99,235) border-bottom-width:2.5px border-color:rgb(37,99,235)":
                      selectedTab() === data,
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
  );

  return (
    <>
      <Tabs />

      <div classList={{ "display:none": selectedTab() !== "layout" }}>
        <LayoutTree />
      </div>
      <div class="p:5" classList={{ "display:none": selectedTab() !== "form" }}>
        <FormConfig />
      </div>
      <Show when={layoutStore.formData?.formData?.L[0] === "Form"}>
        <div classList={{ "display:none": selectedTab() !== "Keys" }}>
          <PrimaryKey />
          <NameKey />
        </div>
        <div
          classList={{ "display:none": selectedTab() !== "Unique constrains" }}
        >
          <UniqueConstrains />
        </div>
      </Show>
      <div classList={{ "display:none": selectedTab() !== "Rules" }}>
        <Rules />
      </div>
      <div classList={{ "display:none": selectedTab() !== "SEO" }}>
        <SeoConfig />
      </div>
    </>
  );
}
