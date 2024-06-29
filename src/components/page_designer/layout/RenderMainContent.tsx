import { type Setter, Show } from "solid-js";
import { Drawer } from "~/components/Drawer";
import { SettingsWrapper } from "../settings/SettingsWrapper";
import { FormElementsWrapper } from "../form_elements/FormElementsWrapper";
import { useDesignerLayoutStore } from "~/components/page_designer/LayoutContext";
import { ResizableContainer } from "~/components/ResizableDivView";
import { PageView } from "~/components/page_attr_render/PageView";

export function RenderMainContent() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
    <div style={{
      'grid-template-columns': (!layoutStore.isLeftOpen && !layoutStore.isRightOpen)
        ? 'repeat(1, 1fr)'
        : (layoutStore.isLeftOpen && layoutStore.isRightOpen)
          ? 'repeat(3, 22% 53% 25%)'
          : `repeat(2, ${!layoutStore.isLeftOpen ? '70% 30%' : '30% 70%'} )`,
    }} class={`grid gap:4px`}>
      <Show
        when={!layoutStore.isSmallScreen}
        fallback={<Drawer
          customButton={() => false}
          drawerStyle={'padding: 10px'}
          open={() => layoutStore.isLeftOpen}
          setIsOpen={((v: boolean) => setLayoutStore("isLeftOpen", v)) as Setter<boolean>}
          width="75%"
        >
          <FormElementsWrapper />
        </Drawer>}
      >
        <div class={`${!layoutStore.isLeftOpen ? 'd:none' : ''}`}>
          <Show when={layoutStore.isLeftOpen}>
            <FormElementsWrapper />
          </Show>
        </div>
      </Show>
      <Show when={layoutStore.formData}>
        <ResizableContainer view={layoutStore.view}>
          <PageView metaVertex={layoutStore.formData?.formData} isPreview={false} />
        </ResizableContainer>
      </Show>
      <Show
        when={!layoutStore.isSmallScreen}
        fallback={<Drawer
          customButton={() => false}
          drawerStyle={'padding: 10px'}
          open={() => layoutStore.isRightOpen}
          setIsOpen={((isOpen: boolean) => setLayoutStore("isRightOpen", isOpen)) as Setter<boolean>}
          width="75%"
        >
          <SettingsWrapper />
        </Drawer>}
      >
        <div class={`${!layoutStore.isRightOpen ? "hidden" : "contents"}`}>
          <SettingsWrapper />
        </div>
      </Show>
    </div>
  );
}
