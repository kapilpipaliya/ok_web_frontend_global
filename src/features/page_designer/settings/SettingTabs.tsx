import { createMemo, For, type JSX, Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import {
  FormContext,
  type FormStoreObject,
} from "~/components/form/context/FormContext";
import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { useGraph } from "~/lib/graph/GraphContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

import {
  DesignerFormIdContext,
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../context/LayoutContext";
import { UlContainer } from "../form_elements/FormElementTabs";
import { TabsContainer } from "../form_elements/TabsContainer";
import { FormConfig } from "./form/FormConfig";
import { NameKey } from "./keys/NameKey";
import { UniqueConstrains } from "./keys/UniqueConstrain";
import { LayoutTree } from "./layout/LayoutTree";
import { Permission } from "./permission/Permission";
import { FormStatus } from "./status/FormStatus";
import { TabButton } from "./TabButton";
import { Variants } from "./variants/Variants";

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
        [`border-color:${props.borderColor || "base"}`]: true,
        [`border-top-width:${props.borderTopWidth || "1px"}`]: true,
        [`width:${props.width || "100%"}`]: true,
      }}
    />
  );
}

export function SettingTabs() {
  const layoutStoreId = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();

  const layoutStore = () =>
    (graph.vertexes[layoutStoreId].P as PageLayoutObject) ?? {};

  const formStoreVertex = () =>
    graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const tabs = createMemo(() => {
    const baseTabs = ["settings", "status", "layers"];
    if (!formStoreVertex()) {
      return baseTabs;
    }
    const formType = graph.vertexes[formStoreVertex()?.P.formDataId!]?.L[0];
    if (formType === "Form") {
      baseTabs.push("Keys");
    }
    if (formType === "Component") {
      baseTabs.push("Variants");
    }
    if (formType === "Form" || formType === "Page") {
      baseTabs.push("Permission");
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
            onClick={() =>
              mergeVertexProperties<PageLayoutObject>(
                0,
                layoutStoreId,
                graph,
                setGraph,
                { selectedTab: data },
              )
            }
          />
        )}
      </For>
    </UlContainer>
  );

  const Tabs = () => (
    <>
      {/* <Icon
        class="bg:base-5:hover color:#c1c1c1 cursor:pointer position:absolute right:0 top:0"
        height={30}
        icon={"ph:x-bold"}
        onClick={() => mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { isRightOpen: false })}
        width={30}
      /> */}
      <TabsContainer>
        <TabList />
      </TabsContainer>
    </>
  );

  return (
    <div class="display:grid grid-template-rows:auto|1fr grid-template-columns:1fr height:100%">
      <div class="bg:base-5 overflow-x:auto">
        <Tabs />
      </div>
      <div class="overflow:auto">
        <div
          class="p:5"
          classList={{
            "display:none": layoutStore().selectedTab !== "settings",
          }}
        >
          <FormConfig />
        </div>

        <Show keyed when={formStoreVertex()?.id}>
          <DesignerFormIdContext.Provider value={formStoreVertex().id}>
            <FormContext.Provider value={formStoreVertex().id}>
              <Show when={layoutStore().selectedTab === "status"}>
                <FormStatus />
              </Show>
              {/* Keep Display:none to keep expanded state */}
              <div
                classList={{
                  "display:none": layoutStore().selectedTab !== "layers",
                }}
              >
                <LayoutTree />
              </div>

              <Show
                when={
                  graph.vertexes[formStoreVertex()?.P.formDataId!]?.L[0] ===
                  "Form"
                }
              >
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
              <Show when={layoutStore().selectedTab === "Variants"}>
                <Variants />
              </Show>
            </FormContext.Provider>
          </DesignerFormIdContext.Provider>
        </Show>
      </div>
    </div>
  );
}
