import { Icon } from "@iconify-icon/solid";
import { createMemo, For, type JSX, Show } from "solid-js";

import { FormContext, FormStoreObject } from "~/components/form/context/FormContext";
import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";

import { useDesignerLayoutStore, PageLayoutObject } from "../context/LayoutContext";
import { UlContainer } from "../form_elements/FormElementTabs";
import {
  TabsContainer,
  TabStickyContainer,
} from "../form_elements/TabsContainer";
import { FormConfig } from "./form/FormConfig";
import { NameKey } from "./keys/NameKey";
import { UniqueConstrains } from "./keys/UniqueConstrain";
import { LayoutTree } from "./layout/LayoutTree";
import { Permission } from "./permission/Permission";
import { Rules } from "./rules/Rules";
import { SEOFormGroupProperties } from "./seo/SeoConfig";
import { FormStatus } from "./status/FormStatus";
import { TabButton } from "./TabButton";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function SettingTabs() {
  const layoutStoreId = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();

  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const tabs = createMemo(() => {
    const baseTabs = ["settings", "status", "layers"];
    const formType = graph.vertexes[formStoreVertex()?.P.formDataId!]?.L[0];
    if (formType === "Form") {
      baseTabs.push("Keys");
    }
    if (formType === "Form" || formType === "Page") {
      baseTabs.push("Rules", "Permission", "SEO");
    }
    return baseTabs;
  });

  const TabList = () => (
    <UlContainer>
      <For each={tabs()}>
        {(data) => (
          <TabButton
            data={data}
            isSelected={layoutStore().selectedTab === data}
            onClick={() => mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { selectedTab: data })}
          />
        )}
      </For>
    </UlContainer>
  );

  const Tabs = () => (
    <TabStickyContainer>
      <Icon
        class="bg:white:hover color:#c1c1c1 cursor:pointer position:absolute right:0 top:0"
        height={30}
        icon={"iconamoon:close-duotone"}
        onClick={() => mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { isRightOpen: false })}
        width={30}
      />
      <TabsContainer>
        <TabList />
      </TabsContainer>
    </TabStickyContainer>
  );

  return (
    <>
      <Tabs />
      <div
        class="p:5"
        classList={{ "display:none": layoutStore().selectedTab !== "settings" }}
      >
        <FormConfig />
      </div>

      <Show when={formStoreVertex()}>
        <FormContext.Provider value={formStoreVertex().id}>
          <Show when={layoutStore().selectedTab === "status"}>
            <FormStatus />
          </Show>
          {/* Keep Display:none to keep expanded state */}
          <div
            classList={{ "display:none": layoutStore().selectedTab !== "layers" }}
          >
            <LayoutTree />
          </div>

          <Show when={graph.vertexes[formStoreVertex().P.formDataId!]?.L[0] === "Form"}>
            <Show when={layoutStore().selectedTab === "Keys"}>
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
          <Show when={layoutStore().selectedTab === "Permission"}>
            <Permission />
          </Show>
          <Show when={layoutStore().selectedTab === "Rules"}>
            <Rules />
          </Show>
          <Show when={layoutStore().selectedTab === "SEO"}>
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
