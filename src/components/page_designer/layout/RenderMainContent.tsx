import Resizable from '@corvu/resizable'
import { createSignal, type Setter, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";
import { FormContext } from "~/components/form/FormContext";
import { PageView } from "~/components/page_attr_render/PageView";
import { useDesignerLayoutStore } from "~/components/page_designer/context/LayoutContext";
import { Drawer } from "~/components/styled/Drawer";
import { ResizableContainer } from "~/components/styled/ResizableDivView";
import { useGraph } from "~/lib/graph/graph";

import { FormElementsWrapper } from "../form_elements/FormElementsWrapper";
import { PropertiesWrapper } from "../settings/properties/PropertiesWrapper";
import { SettingsWrapper } from "../settings/SettingsWrapper";
import { DeleteAttributeDialog } from "./DeleteRuleDialog";
import { makePersisted } from '@solid-primitives/storage';
import { BroadcastChannel } from 'broadcast-channel';

function FormElements() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
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
  );
}

function PageViewComponent() {
  const [graph] = useGraph();
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();

  const IFrame = () => {
    const channel = new BroadcastChannel('foobar');
    const [graph] = useGraph();
    
    const onLoad = () => {
      setTimeout(() => {
        channel.postMessage(JSON.stringify({graph}));
        channel.postMessage(JSON.stringify({layoutStore: layoutStore}));
      }, 1000);
    };
    
    {/* TODO: use unique id for each page */ }
    return <iframe
      src={`${window.location.origin}/page_design_preview?id=${layoutStore.formStore[0]?.formDataId}`}
      style={{ width: "100%", height: "100%", border: "none" }}
      onLoad={onLoad}
    />
  }
  return (
    <Show when={layoutStore.formStore[0]?.id}>
      <ResizableContainer view={layoutStore.view}>
        {/* <IFrame /> */}
        <PageView
          isDesignMode={true}
          isNoPermissionCheck={true}
          metaVertex={graph.vertexes[layoutStore.formStore[0]?.formDataId!]}
        />
      </ResizableContainer>
    </Show>
  );
}

function Settings() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
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
  );
}

function PropertiesContent() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  const [graph] = useGraph();
  return (
    <Show
      when={
        layoutStore.formStore[0] &&
        layoutStore.selectedComponent !== -1 &&
        graph.vertexes[layoutStore.selectedId]
      }
    >
      <FormContext.Provider value={layoutStore.formStore}>
        <PropertiesWrapper />
      </FormContext.Provider>
    </Show>
  );
}

function DeleteConfirmation() {
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
    <Show
      when={
        Object.keys(layoutStore.usedAttrsInRules).length > 0 ||
        layoutStore.usedAttrsInUniqueConstraints.length > 0 ||
        layoutStore.usedAttrsInNameKeys.length > 0 ||
        layoutStore.shouldContainAtLeastOneForm
      }
    >
      <ZIndex>
        <DeleteAttributeDialog />
      </ZIndex>
    </Show>
  );
}

export function RenderMainContent() {
  return <ResizableAltKey />
}
export default RenderMainContent

export function ResizableAltKey() {
  const [layoutStore] = useDesignerLayoutStore();
  const [sizes, setSizes] = makePersisted(createSignal<number[]>([]), {
    name: 'resizable-sizes',
  })
  const [graph] = useGraph();
  return (
    <div class="size-full p-4">
      <Resizable class="size-full" sizes={sizes()} onSizesChange={setSizes}>
        <Resizable.Panel
          class=""
          initialSize={sizes()[0] ?? "300px"}
          minSize={"200px"}
        >
          <FormElements />
        </Resizable.Panel>
        <Resizable.Handle
          aria-label="Resize Handle"
          class="px:3"
        >
          <div class="" />
        </Resizable.Handle>
        <Resizable.Panel
          class="flex-col items-center justify-center space-y-2 overflow-hidden rounded-lg bg-corvu-100 px-4 flex"
          initialSize={sizes()[1] ?? 0.7}
          minSize={0.2}
        >
          <PageViewComponent />
        </Resizable.Panel>
        <Resizable.Handle
          aria-label="Resize Handle"
          class="px:3"
        >
          <div class="" />
        </Resizable.Handle>
        <Resizable.Panel
          class="bl:1|solid|lightgrey"
          initialSize={sizes()[2] ?? "350px"}
          minSize={"200px"}
        >
          <Show
            fallback={
              <div class="bl:1|solid|lightgrey pl:8 pt:8">
                Element is not selected
              </div>
            }
            when={
              layoutStore.selectedId !== -1 &&
              graph.vertexes[layoutStore.selectedId] &&
              graph.vertexes[layoutStore.selectedId].L?.[0]?.endsWith("Attr")
            }
          >
            <div
              class={`scrollbar-color:lightgrey {scrollbar-width:thin} bl:1|solid|lightgrey max-height:calc(100vh-${graph.navBarHeight + 2}px) overflow:auto p:5`}
            >
              <PropertiesContent />
            </div>
          </Show>
        </Resizable.Panel>
        <Resizable.Handle
          aria-label="Resize Handle"
          class="px:3"
        >
          <div class="" />
        </Resizable.Handle>
        <Resizable.Panel
          class=""
          initialSize={sizes()[3] ?? "400px"}
          minSize={"200px"}
        >
          <Settings />
        </Resizable.Panel>
      </Resizable>
      <DeleteConfirmation />
    </div>
  )
}
