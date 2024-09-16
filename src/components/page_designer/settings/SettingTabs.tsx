import { Icon } from "@iconify-icon/solid";
import { createMemo, createSignal, For, type JSX, Show } from "solid-js";

import { FormContext } from "~/components/form/FormContext";
import { HeaderWithDescription } from "~/components/HeaderWithDescription";
import { capitalizeFirstLetter } from "~/lib/data_structure/string/capitalizeFirstLetter";

import { useDesignerLayoutStore } from "../LayoutContext";
import { FormConfig } from "./form/FormConfig";
import { NameKey } from "./keys/NameKey";
import { UniqueConstrains } from "./keys/UniqueConstrain";
import { LayoutTree } from "./layout/LayoutTree";
import { Permission } from "./permission/Permission";
import { Rules } from "./rules/Rules";
import { SEOFormGroupProperties } from "./seo/SeoConfig";
import { FormStatusWrapper } from "./status/FormStatusWrapper";

export function SettingTabs() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();

  const tabs = createMemo(() => {
    const baseTabs = ["settings", "layers"];
    if (layoutStore.formStore[0]?.formData?.L[0] === "Form") {
      baseTabs.push("Keys");
    }
    if (
      layoutStore.formStore[0]?.formData?.L[0] === "Form" ||
      layoutStore.formStore[0]?.formData?.L[0] === "Page"
    ) {
      baseTabs.push("Rules", "Permission", "SEO");
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
        <ul class="overflow-x-auto flex {scrollbar-width:thin} jc:space-around  margin-bottom:-1px ">
          <For each={tabs()}>
            {(data) => (
              <li class="me-2 cursor:pointer">
                <button
                  class="rounded-t-lg border-bottom-width:2.5px border-color:transparent display:inline-block p:10px"
                  classList={{
                    "border-color:rgb(209,213,219):hover color:rgb(75,85,99):hover":
                      layoutStore.selectedTab !== data,
                    "font-weight:600 color:rgb(37,99,235) border-bottom-width:2.5px border-color:rgb(37,99,235)":
                      layoutStore.selectedTab === data,
                  }}
                  onclick={() => setLayoutStore("selectedTab", data)}
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
      <div
        class="p:5"
        classList={{ "display:none": layoutStore.selectedTab !== "settings" }}
      >
        <FormConfig />
        <Show when={layoutStore.formStore[0]}>
          <FormContext.Provider value={layoutStore.formStore}>
            <FormStatusWrapper />
          </FormContext.Provider>
        </Show>
      </div>

      <Show when={layoutStore.formStore[0]}>
        <FormContext.Provider value={layoutStore.formStore}>
          <div classList={{ "display:none": layoutStore.selectedTab !== "layers" }}>
            <LayoutTree />
          </div>

          <Show when={layoutStore.formStore[0]?.formData?.L[0] === "Form"}>
            <Show when={layoutStore.selectedTab === "Keys"}>
              {/* <PrimaryKey /> */}
              <NameKey />
              <Divider class="mt:10" />
              <HeaderWithDescription
                description="Add unique constrains to your form to ensure that no duplicate data is submitted."
                title="Unique Constrains"
              />
              <UniqueConstrains />
            </Show>
          </Show>
          <Show when={layoutStore.selectedTab === "Permission"}>
            <Permission />
          </Show>
          <Show when={layoutStore.selectedTab === "Rules"}>
            <Rules />
          </Show>
          <Show when={layoutStore.selectedTab === "SEO"}>
            <SEOFormGroupProperties />
          </Show>
        </FormContext.Provider>
      </Show>
    </>
  );
}

interface DividerProps {
  borderColor?: string;
  borderTopWidth?: string;
  class?: string;
  width?: string;
}

export function Divider(props: Readonly<DividerProps>): JSX.Element {
  return (
    <div
      class={props.class || ""}
      classList={{
        [`border-color:${props.borderColor || "rgb(209,213,219)"}`]: true,
        [`border-top-width:${props.borderTopWidth || "1px"}`]: true,
        [`width:${props.width || "100%"}`]: true,
      }}
    />
  );
}
