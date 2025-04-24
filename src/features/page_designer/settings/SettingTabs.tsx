import { createMemo, For, Show } from "solid-js";

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
import { TabButton } from "./TabButton";
import { Variants } from "./variants/Variants";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import type {
  FunctionArgumentType,
} from "~/components/form/type/FieldSchemaType";
import { Divider } from "~/components/styled/Divider";

export function SettingTabs() {
  const layoutStoreId = useDesignerLayoutStore();
  const [graph, setGraph] = useGraph();

  const layoutStore = () =>
    (graph.vertexes[layoutStoreId].P as PageLayoutObject) ?? {};

  const formStoreVertex = () =>
    graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const tabs = createMemo(() => {
    return ["settings"];
  });

  const TabList = () => (
    <UlContainer>
      <For each={tabs()}>
        {(data) => (
          <TabButton
            data={data}
            isSelected={true}
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
      <TabsContainer>
        <TabList />
      </TabsContainer>
    </>
  );

  return (
    <As
      as="div"
      css={css`
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr;
  height: 100%;
`}
    >
      {/* <As
        as="div"
        css={(args: FunctionArgumentType) => css`
  background-color: ${args.theme.var.color.base_10};
  overflow-x: auto;
`}
      >
        <Tabs />
      </As> */}
      <As
        as="div"
        css={css`
  overflow: auto;
`}
      >
        <As
          as="div"
          css={css`
  padding: 5px;
  height: 100%;
`}
        >
          <FormConfig />
          
          <Show keyed when={formStoreVertex()?.id}>
            <DesignerFormIdContext.Provider value={formStoreVertex().id}>
              <FormContext.Provider value={formStoreVertex().id}>

                <Show
                  when={
                    graph.vertexes[formStoreVertex()?.P.formDataId]?.L?.[0] ===
                    "Form"
                  }
                >
                  <Divider />
                  <NameKey />
                  <Divider />
                  <HeaderWithDescription
                    description="Add unique constrains to your form to ensure that no duplicate data is submitted."
                    title="Unique Constrains"
                  />
                  <UniqueConstrains />
                </Show>

                <Show
                  when={
                    graph.vertexes[formStoreVertex()?.P.formDataId]?.L?.[0] === "Form" ||
                    graph.vertexes[formStoreVertex()?.P.formDataId]?.L?.[0] === "Page"
                  }
                >
                  <Divider />
                  <Permission />
                </Show>

                <Show
                  when={
                    graph.vertexes[formStoreVertex()?.P.formDataId]?.L?.[0] === "Component"
                  }
                >
                  <Divider />
                  Variants
                  <Variants />
                </Show>
                <LayoutTree />
              </FormContext.Provider>
            </DesignerFormIdContext.Provider>
          </Show>
        </As>
      </As>
    </As>
  );
}
