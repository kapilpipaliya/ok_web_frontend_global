import { type Setter, Show } from "solid-js";

import { Drawer } from "~/components/Drawer";
import { ResizableContainer } from "~/components/ResizableDivView";
import { ZIndex } from "~/components/ZIndex";
import { PageView } from "~/components/page_attr_render/PageView";
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";

import { FormElementsWrapper } from "../form_elements/FormElementsWrapper";
import { SettingsWrapper } from "../settings/SettingsWrapper";

export function RenderMainContent() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
    <div
      class={`${
        !layoutStore.isLeftOpen && !layoutStore.isRightOpen
          ? "grid-template-columns:repeat(1,1fr)"
          : layoutStore.isLeftOpen && layoutStore.isRightOpen
            ? "grid-template-columns:repeat(3,22%|53%|25%)"
            : `grid-template-columns:repeat(2,${!layoutStore.isLeftOpen ? "70%|30%" : "30%|70%"}`
      } grid gap:4px`}
    >
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
        <div class={`${!layoutStore.isLeftOpen ? "d:none" : ""}`}>
          <Show when={layoutStore.isLeftOpen}>
            <FormElementsWrapper />
          </Show>
        </div>
      </Show>
      <Show when={layoutStore.formData}>
        <ResizableContainer view={layoutStore.view}>
          <PageView
            isPreview={false}
            metaVertex={layoutStore.formData?.formData}
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
        <div class={`${!layoutStore.isRightOpen ? "hidden" : ""}`}>
          <SettingsWrapper />
        </div>
      </Show>
    </div>
  );
}
