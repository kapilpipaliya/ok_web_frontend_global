import Resizable from '@corvu/resizable'
import { createSignal, For, type Setter, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";
import { FormContext } from "~/components/form/context/FormContext";
import { PageView } from "~/components/page_attr_render/PageView";
import { useDesignerLayoutStore } from "~/components/page_designer/context/LayoutContext";
import { Drawer } from "~/components/styled/Drawer";
import { ResizableContainer } from "~/components/styled/ResizableDivView";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { PageLayoutObject } from "../context/LayoutContext";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { FormElementsWrapper } from "../form_elements/FormElementsWrapper";
import { PropertiesWrapper } from "../settings/properties/PropertiesWrapper";
import { SettingsWrapper } from "../settings/SettingsWrapper";
import { DeleteAttributeDialog } from "./DeleteRuleDialog";
import { makePersisted } from '@solid-primitives/storage';
import { mergeVertexProperties } from '~/lib/graph/mutate/vertex';
import { getGlobalStore } from '~/lib/graph/get/sync/getGlobalStore';
import { ResizeOverlay } from "~/components/styled/ResizeOverlay";
import { IFramePreview } from './IFramePreview';
import { isDisabledTxn } from '~/lib/graph/transaction/isDisabledTxn';

function FormElements() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  return (
    <Show
      fallback={
        <ZIndex>
          <Drawer
            customButton={() => false}
            drawerClass={"padding:10px"}
            open={() => layoutStore().isLeftOpen}
            setIsOpen={
              ((v: boolean) =>
                mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { isLeftOpen: v })) as Setter<boolean>
            }
            width="75%"
          >
            <FormElementsWrapper />
          </Drawer>
        </ZIndex>
      }
      when={!layoutStore().isSmallScreen}
    >
      <Show when={layoutStore().isLeftOpen}>
        <FormElementsWrapper />
      </Show>
    </Show>
  );
}

function TabBar() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

  const handleClose = (formId: string) => {
    // Note: cloneProperties is false because we don't want to clone the properties of the form. It cause re-render of the form.
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId,
      graph,
      setGraph,
      {
        openedFormIds: layoutStore().openedFormIds.filter(f => f.formId !== formId),
        formId: layoutStore().openedFormIds.find(f => f.formId !== formId)?.formId || null
      },
      { cloneProperties: false }
    );
  };

  const handleTabClick = (formId: string) => {
    mergeVertexProperties<PageLayoutObject>(
      0,
      layoutStoreId,
      graph,
      setGraph,
      {
        formId
      }
    );
  };

  const isUnsaved = (formId: string) => {
    const vertex = graph.vertexes[formId] as Vertex<FormStoreObject>;
    return vertex?.P.txnId && !isDisabledTxn(vertex.P.txnId, graph);
  };

  return (
    <div class="display:flex gap:5px padding:5px">
      <For each={layoutStore().openedFormIds}>
        {(form, index) => (
          <div
            class={`align-items:center border-radius:4px cursor:pointer display:flex gap:5px padding:5px ${layoutStore().formId === form.formId ? "background:#e0e0e0" : ""
              }`}
            onClick={[handleTabClick, form.formId]}
          >
            <span>
              {form.label}
              {isUnsaved(form.formId) && "*"}
            </span>
            <Show when={index() !== 0}>
              <button
                class="background:none border:none cursor:pointer font-size:14px padding:2px"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose(form.formId);
                }}
              >
                ×
              </button>
            </Show>
          </div>
        )}
      </For>
    </div>
  );
}
function PageViewComponent() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = (formId: string) => graph.vertexes[formId] as Vertex<FormStoreObject>;

  return (
    <For each={layoutStore().openedFormIds}>
      {(form) => {
        const isActive = () => layoutStore().formId === form.formId;
        const vertex = () => formStoreVertex(form.formId);

        return (
          <Show when={vertex()?.P.id}>
            <ResizableContainer
              view={vertex()?.P.view}
              class={isActive() ? '' : 'hidden'}
            >
              <IFramePreview />
              {/* <PageView
                isDesignMode={true}
                isNoPermissionCheck={true}
                metaVertex={graph.vertexes[vertex()?.P.formDataId!]}
              /> */}
            </ResizableContainer>
          </Show>
        );
      }}
    </For>
  );
}

function Settings() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  return (
    <Show
      fallback={
        <ZIndex>
          <Drawer
            customButton={() => false}
            drawerClass={"padding:10px"}
            open={() => layoutStore().isRightOpen}
            setIsOpen={
              ((isOpen: boolean) =>
                mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, { isRightOpen: isOpen })) as Setter<boolean>
            }
            width="75%"
          >
            <SettingsWrapper />
          </Drawer>
        </ZIndex>
      }
      when={!layoutStore().isSmallScreen}
    >
      <SettingsWrapper />
    </Show>
  );
}

function PropertiesContent() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;
  return (
    <Show
      when={
        formStoreVertex()?.P &&
        formStoreVertex()?.P.selectedComponent !== -1 &&
        graph.vertexes[formStoreVertex()?.P.selectedId]
      }
    >
      <FormContext.Provider value={layoutStore().formId!}>
        <PropertiesWrapper />
      </FormContext.Provider>
    </Show>
  );
}

function DeleteConfirmation() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;
  return (
    <Show
      when={
        Object.keys(formStoreVertex()?.P.usedAttrsInRules ?? {}).length > 0 ||
        formStoreVertex()?.P.usedAttrsInUniqueConstraints.length > 0 ||
        formStoreVertex()?.P.usedAttrsInNameKeys.length > 0 ||
        formStoreVertex()?.P.shouldContainAtLeastOneForm
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
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;
  const [sizes, setSizes] = makePersisted(createSignal<number[]>([]), {
    name: 'resizable-sizes',
  })
  const [isResizing, setIsResizing] = createSignal(false);

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
          onHandleDragStart={() => setIsResizing(true)}
          onHandleDragEnd={() => setIsResizing(false)}
        >
          <div class="" />
        </Resizable.Handle>
        <Resizable.Panel
          class="flex-col items-center justify-center space-y-2 overflow-hidden rounded-lg bg-corvu-100 px-4 flex"
          initialSize={sizes()[1] ?? 0.7}
          minSize={0.2}
        >
          <div>
            <TabBar />
            <PageViewComponent />
          </div>
        </Resizable.Panel>
        <Resizable.Handle
          aria-label="Resize Handle"
          class="px:3"
          onHandleDragStart={() => setIsResizing(true)}
          onHandleDragEnd={() => setIsResizing(false)}
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
              formStoreVertex()?.P.selectedId !== -1 &&
              graph.vertexes[formStoreVertex()?.P.selectedId] &&
              graph.vertexes[formStoreVertex()?.P.selectedId].L?.[0]?.endsWith("Attr")
            }
          >
            <div
              class={`scrollbar-color:lightgrey {scrollbar-width:thin} bl:1|solid|lightgrey max-height:calc(100vh-${getGlobalStore(graph).P.navBarHeight + 2}px) overflow:auto p:5`}
            >
              <PropertiesContent />
            </div>
          </Show>
        </Resizable.Panel>
        <Resizable.Handle
          aria-label="Resize Handle"
          class="px:3"
          onHandleDragStart={() => setIsResizing(true)}
          onHandleDragEnd={() => setIsResizing(false)}
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
      <Show when={isResizing()}>
        <ResizeOverlay />
      </Show>
    </div>
  )
}
