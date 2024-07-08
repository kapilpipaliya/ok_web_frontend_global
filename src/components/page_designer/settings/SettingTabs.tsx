import { Icon } from "@iconify-icon/solid";
import { For, Show, createMemo, createSignal } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { capitalizeFirstLetter } from "~/lib/utils";

import { useDesignerLayoutStore } from "../LayoutContext";
import { FormConfig } from "./FormConfig";
import { LayoutTree } from "./LayoutTree";

export function SettingTabs() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [selectedTab, setSelectedTab] = createSignal("layout");

  const tabs = createMemo(() => {
    const baseTabs = ["layout", "form"];
    if (layoutStore.formData?.formData?.L[0] === "Form") {
      baseTabs.push("Primary key", "Unique constrains");
    }
    return baseTabs;
  });

  const Tabs = () => <div class="bg:white position:sticky top:0">
    <div class="flex ai:center jc:space-between position:relative">
      <Icon
        class="bg:white:hover color:#c1c1c1 cursor:pointer position:absolute right:0 top:0"
        height={30}
        icon={"iconamoon:close-duotone"}
        onClick={() => setLayoutStore('isRightOpen', false)}
        width={30} />
    </div>
    <div class="lh:1rem border-bottom-width:1px border-color:rgb(229,231,235) color:rgb(107,114,128)  f:0.875rem  font-weight:500  mb:10  text-align:center ">
      <ul class="flex  flex-wrap:wrap jc:space-around  margin-bottom:-1px ">
        <For each={tabs()}>
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
      <Show when={layoutStore.formData?.formData?.L[0] === "Form"}>
        <div classList={{ "display:none": selectedTab() !== "Primary key" }}>
          <PrimaryKey />
          <NameKey />
        </div>
        <div classList={{ "display:none": selectedTab() !== "Unique constrains" }}>
          <UniqueConstrains />
        </div>
      </Show>
    </div>
  );
}

const PrimaryKey = () => {
  const [layoutStore] = useDesignerLayoutStore();
  return (
    <div class="flex ai:center gap:2 justify-content:space-between mt:6">
      <span class="f:15 flex:.5">
        Primary Key
      </span>
      <span class="f:15 flex:1">
        <DynamicComponent
          component={"TagBox"}
          data={layoutStore.formData?.formData}
          isRealTime={false}
          meta={{ P: { name: "pk" } } as unknown as Vertex}
          //  Todo Add tree options, only includes the top level fields.
          txnId={layoutStore.formData.txnId}
        />
      </span>
    </div>
  );
}

const NameKey = () => {
  const [layoutStore] = useDesignerLayoutStore();
  return (
    <div class="flex ai:center gap:2 justify-content:space-between mt:6">
      <span class="f:15 flex:.5">
        Name Key
      </span>
      <span class="f:15 flex:1">
        <DynamicComponent
          component={"TagBox"}
          data={layoutStore.formData?.formData}
          isRealTime={false}
          meta={{ P: { name: "nameKey" } } as unknown as Vertex}
          //  Todo Add tree options, only includes the top level fields.
          txnId={layoutStore.formData.txnId}
        />
      </span>
    </div>
  );
}
const UniqueConstrains = () => {
  return <div>Unique Constrains:</div>
}