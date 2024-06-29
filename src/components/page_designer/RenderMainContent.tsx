import { type Setter, Show } from "solid-js";
import { ContentDragAndDrop } from "./Content_DragAndDrop";
import { Drawer } from "~/components/Drawer";
import { ActionsDragAndDrops } from "./actions/Actions_DragAndDrops";
import { FormElementsWrapper } from "./menu/FormElementsWrapper";
import { useStore } from "~/components/page_designer/LayoutContext";

export function RenderMainContent() {
  const [store, setStore] = useStore();
  return (
    <div style={{
      'grid-template-columns': (!store.isLeftOpen && !store.isRightOpen)
        ? 'repeat(1, 1fr)'
        : (store.isLeftOpen && store.isRightOpen)
          ? 'repeat(3, 22% 53% 25%)'
          : `repeat(2, ${!store.isLeftOpen ? '70% 30%' : '30% 70%'} )`,
    }} class={`grid gap:4px`}>
      <Show
        when={!store.isSmallScreen}
        fallback={<Drawer
          customButton={() => false}
          drawerStyle={'padding: 10px'}
          open={() => store.isLeftOpen}
          setIsOpen={((v: boolean) => setStore("isLeftOpen", v)) as Setter<boolean>}
          width="75%"
        >
          <FormElementsWrapper
            toggleIsLeftOpen={((isOpen: boolean) => setStore("isLeftOpen", isOpen)) as Setter<boolean>}
            leftColumns={store.leftMenuTabs} />
        </Drawer>}
      >
        <div class={`${!store.isLeftOpen ? 'd:none' : ''}`}>
          <Show when={store.isLeftOpen}>
            <FormElementsWrapper
              toggleIsLeftOpen={((isOpen: boolean) => setStore("isLeftOpen", isOpen)) as Setter<boolean>}
              leftColumns={store.leftMenuTabs} />
          </Show>
        </div>
      </Show>
      <ContentDragAndDrop view={() => store.view} />
      <Show
        when={!store.isSmallScreen}
        fallback={<Drawer
          customButton={() => false}
          drawerStyle={'padding: 10px'}
          open={() => store.isRightOpen}
          setIsOpen={((isOpen: boolean) => setStore("isRightOpen", isOpen)) as Setter<boolean>}
          width="75%"
        >
          <ActionsDragAndDrops
            isRightOpen={() => store.isRightOpen}
            toggleIsRightOpen={((isOpen: boolean) => setStore("isRightOpen", isOpen)) as Setter<boolean>}
            rightColumns={() => store.rightMenuTabs} />
        </Drawer>}
      >
        <div class={`${!store.isRightOpen ? "hidden" : "contents"}`}>
          <ActionsDragAndDrops
            isRightOpen={() => store.isRightOpen}
            toggleIsRightOpen={((isOpen: boolean) => setStore("isRightOpen", isOpen)) as Setter<boolean>}
            rightColumns={() => store.rightMenuTabs} />
        </div>
      </Show>
    </div>
  );
}
