import { type Setter, Show } from "solid-js";

import { Drawer } from "~/components/Drawer";
import { FormContext } from "~/components/form/FormContext";
import { PageView } from "~/components/page_attr_render/PageView";
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";
import { ResizableContainer } from "~/components/ResizableDivView";
import { ZIndex } from "~/components/ZIndex";

import { FormElementsWrapper } from "../form_elements/FormElementsWrapper";
import { PropertiesWrapper } from "../settings/properties/PropertiesWrapper";
import { SettingsWrapper } from "../settings/SettingsWrapper";
import { DeleteAttributeDialog } from "./DeleteRuleDialog";

export function RenderMainContent() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const getGridTemplateColumns = () => {
    if (!(layoutStore.isLeftOpen || layoutStore.isRightOpen)) {
      return "1,1fr";
    }
    if (layoutStore.isLeftOpen && layoutStore.isRightOpen) {
      return "3,22%|calc(53%-8px)|25%";
    }
    return `2,${layoutStore.isLeftOpen ? "30%|70%" : "70%|30%"}`;
  };
  return (
    <div class={`grid gap:4px grid-template-columns:repeat(${getGridTemplateColumns()})`}>
      <Show
        fallback={
          <ZIndex>
            <Drawer
              customButton={() => false}
              drawerClass={"padding:10px"}
              open={() => layoutStore.isLeftOpen}
              setIsOpen={
                ((v: boolean) =>
                  setLayoutStore("isLeftOpen", v)) as Setter<boolean>
              }
              width="75%"
            >
              <FormElementsWrapper />
            </Drawer>
          </ZIndex>
        }
        when={!layoutStore.isSmallScreen}
      >
        <Show when={layoutStore.isLeftOpen}>
          <FormElementsWrapper />
        </Show>
      </Show>
      <Show when={layoutStore.formStore[0]}>
        <ResizableContainer view={layoutStore.view}>
          <PageView
            isDesignMode={true}
            isNoPermissionCheck={true}
            metaVertex={layoutStore.formStore[0]?.formData}
          />
        </ResizableContainer>
      </Show>
      <Show
        fallback={
          <ZIndex>
            <Drawer
              customButton={() => false}
              drawerClass={"padding:10px"}
              open={() => layoutStore.isRightOpen}
              setIsOpen={
                ((isOpen: boolean) =>
                  setLayoutStore("isRightOpen", isOpen)) as Setter<boolean>
              }
              width="75%"
            >
              <SettingsWrapper />
            </Drawer>
          </ZIndex>
        }
        when={!layoutStore.isSmallScreen}
      >
        <SettingsWrapper />
      </Show>
      <Show when={layoutStore.showPropertiesDrawer}>
        <ZIndex>
          <Drawer
            customButton={() => false}
            drawerClass={"padding:10px"}
            open={() => layoutStore.showPropertiesDrawer}
            setIsOpen={
              ((v: boolean) =>
                setLayoutStore("showPropertiesDrawer", v)) as Setter<boolean>
            }
          >
            <Show when={layoutStore.formStore[0]}>
              <FormContext.Provider value={layoutStore.formStore}>
                <PropertiesWrapper />
              </FormContext.Provider>
            </Show>

          </Drawer>
        </ZIndex>
      </Show>
      <Show when={Object.keys(layoutStore.usedAttrsInRules).length > 0 || layoutStore.usedAttrsInUniqueConstraints.length > 0 || layoutStore.usedAttrsInNameKeys.length > 0 || layoutStore.shouldContainAtLeastOneForm}>
        <ZIndex>
          <DeleteAttributeDialog />
        </ZIndex>
      </Show>
    </div>
  );
}
