import { Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import {
  FormContext,
  type FormStoreObject,
} from "~/components/form/context/FormContext";
import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { useGraph } from "~/lib/graph/GraphContext";

import {
  DesignerFormIdContext,
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../context/LayoutContext";
import { FormConfig } from "./form/FormConfig";
import { NameKey } from "./keys/NameKey";
import { UniqueConstrains } from "./keys/UniqueConstrain";
import { LayoutTree } from "./layout/LayoutTree";
import { Permission } from "./permission/Permission";
import { Variants } from "./variants/Variants";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import { Divider } from "~/components/styled/Divider";
import { isPermissionsConfigurable } from "./utils/permissionUtils";

export function SettingTabs() {
  const layoutStoreId = useDesignerLayoutStore();
  const [graph] = useGraph();

  const layoutStore = () =>
    (graph.vertexes[layoutStoreId].P as PageLayoutObject) ?? {};

  const formStoreVertex = () =>
    graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

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
                    "Page"
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
                  when={isPermissionsConfigurable(graph, formStoreVertex()?.P.formDataId)}
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
                  <Variants />
                </Show>
                <Divider />
                <LayoutTree />
              </FormContext.Provider>
            </DesignerFormIdContext.Provider>
          </Show>
        </As>
      </As>
    </As>
  );
}
