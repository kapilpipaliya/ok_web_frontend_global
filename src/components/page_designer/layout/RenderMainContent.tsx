import Resizable from '@corvu/resizable'
import { Component, createSignal, For, type Setter, Show } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import { ZIndex } from "~/components/fields/ZIndex";
import { FormContext } from "~/components/form/context/FormContext";
import { PageView } from "~/components/page_attr_render/PageView";
import { DesignerFormIdContext, useDesignerFormIdContext, useDesignerLayoutStore } from "~/components/page_designer/context/LayoutContext";
import { Drawer } from "~/components/styled/Drawer";
import { ResizableContainer } from "~/components/styled/ResizableDivView";
import { Id, useGraph, Vertex } from "~/lib/graph/graph";
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
import { UndoRedoIcons } from './page_tabbar/UndoRedoIcons';
import { ResizeViewButtons } from './page_tabbar/ResizeViewButtons';
import { DebugInfo } from './page_tabbar/DebugInfo';
import { SaveIconButton } from './page_tabbar/SaveIconButton';
import { PreviewButton } from './page_tabbar/PreviewButton';
import { ShareButton } from './page_tabbar/ShareButton';
import { createViewVertex } from '~/lib/graph/mutate/createViewVertex';
import { createStore } from 'solid-js/store';

function FormElements() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
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
  const layoutStore = () => (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

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
            class={`align-items:center border-radius:4px cursor:pointer display:flex gap:5px padding:5px ${useDesignerFormIdContext() === form.formId ? "background:#e0e0e0" : ""
              }`}
            onClick={[handleTabClick, form.formId]}
          >
            <span>
              {form.label}
              {isUnsaved(form.formId) && "*"}
            </span>
            <button
              class="background:none border:none cursor:pointer font-size:14px padding:2px"
              onClick={() => {
                const newView = createViewVertex({ view: "Mobile" }, graph, setGraph);
                mergeVertexProperties<FormStoreObject>(
                  0,
                  form.formId,
                  graph,
                  setGraph,
                  {
                    openedViews: [...graph.vertexes[form.formId]?.P.openedViews, newView.id]
                  }
                );
              }}
            >
              +
            </button>
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

export function PageTabBar(props: { formStoreId: Id, openIndex: number }) {
  return (
    <header class="flex bg:#f3f3f4 gap:6 r:7">

      <div class="flex ai:center gap:6">
        <UndoRedoIcons formStoreId={props.formStoreId} />
        <ResizeViewButtons formStoreId={props.formStoreId} openIndex={props.openIndex} />
        {/* <SettingPageIcon /> */}
      </div>

      <DebugInfo formStoreId={props.formStoreId} />
      {/* <Show when={layoutStore().selectedSection === "setting"}>
        <div class="flex ai:center">
          <MiddleSectionButtons />
        </div>
      </Show> */}
      <div class="flex ai:center gap:6">
        <SaveIconButton formStoreId={props.formStoreId} />
        <PreviewButton formStoreId={props.formStoreId} />
        <ShareButton formStoreId={props.formStoreId} />
      </div>
    </header>
  )
}

function PageViewComponent() {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};

  return (
    <div class="flex gap:8 overflow:scroll flex:nowrap max-w:2000px">
      <For each={layoutStore().openedFormIds}>
        {(pageInfo) => {
          const isActive = () => layoutStore().formId === pageInfo.formId;
          const formStoreVertex = () => graph.vertexes[pageInfo.formId] as Vertex<FormStoreObject>;

          return (
            <Show when={formStoreVertex()?.id}>
              <For each={formStoreVertex()?.P.openedViews}>
                {(openedView, index) => (
                  <ResizableContainer
                    view={openedView}
                    class={isActive() ? '' : 'hidden'}
                  >
                    <PageTabBar formStoreId={pageInfo.formId} openIndex={index()} />
                    <IFramePreview formStoreId={pageInfo.formId} />
                    {/* <PageView
                      isDesignMode={true}
                      isNoPermissionCheck={true}
                      metaVertex={graph.vertexes[vertex()?.P.formDataId!]}
                    /> */}
                  </ResizableContainer>
                )}
              </For>
            </Show>
          );
        }}
      </For>
    </div>
  );
}

function Settings() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
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
  const layoutStore = () => (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;
  return (
    <Show when={formStoreVertex()?.id} keyed>
      <Show
        when={
          formStoreVertex()?.P &&
          formStoreVertex()?.P.selectedComponent !== -1 &&
          graph.vertexes[formStoreVertex()?.P.selectedId] &&
          graph.vertexes[formStoreVertex()?.P.selectedId].L?.[0]?.endsWith("Attr")
        }
      >
        <DesignerFormIdContext.Provider value={formStoreVertex().id}>
          <FormContext.Provider value={formStoreVertex().id}>
            <PropertiesWrapper />
          </FormContext.Provider>
        </DesignerFormIdContext.Provider>
      </Show>
    </Show>
  );
}

function DeleteConfirmation() {
  const [graph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
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
export default RenderMainContent;

interface ResizeHandleProps {
  onMouseDown: (e: MouseEvent) => void;
  isHorizontal?: boolean;
  position: 'left' | 'right' | 'top';
}
const ResizeHandle: Component<ResizeHandleProps> = (props) => {
  const isHorizontal = props.isHorizontal ?? true;

  return (
    <div
      class={`
        position:absolute
        ${props.position}:-3px
        ${isHorizontal ? 'top:0' : 'top:-3px'}
        ${isHorizontal ? 'width:6px' : 'width:100%'}
        ${isHorizontal ? 'height:100%' : 'height:6px'}
        ${isHorizontal ? 'cursor:col-resize' : 'cursor:row-resize'}
        background-color:transparent
        z-index:1
      `}
      onMouseDown={props.onMouseDown}
    />
  );
};

interface PanelProps {
  children: any;
  onResize?: (e: MouseEvent) => void;
  resizePosition?: 'left' | 'right' | 'top';
  style?: any;
}

const Panel: Component<PanelProps> = (props) => {
  return (
    <div style={{
      // 'background-color': '#f0f0f0',
      // 'border': '1px solid #ccc',
      position: 'relative',
      ...props.style
    }}>
      {props.children}
      <Show when={props.onResize}>
        <ResizeHandle
          onMouseDown={props.onResize!}
          position={props.resizePosition || 'right'}
          isHorizontal={props.resizePosition !== 'top'}
        />
      </Show>
    </div>
  );
};

export function ResizableAltKey() {
  const [graph] = useGraph()
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const [sizes, setSizes] = createStore({
    leftWidth: 300,
    rightWidth1: 400,
    rightWidth2: 300,
    bottomHeight: 300
  });

  const [isResizing, setIsResizing] = createSignal(false);

  const createResizeHandler = (key: keyof typeof sizes, isHorizontal: boolean) => (e: MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startPos = isHorizontal ? e.pageX : e.pageY;
    const startSize = sizes[key];

    const onMouseMove = (e: MouseEvent) => {
      const currentPos = isHorizontal ? e.pageX : e.pageY;
      const diff = currentPos - startPos;

      // Determine if we're resizing from left/top (positive) or right/bottom (negative)
      const isPositiveResize = key === 'leftWidth';
      const newSize = Math.max(100, startSize + (isPositiveResize ? diff : -diff));

      setSizes({
        ...sizes,
        [key]: newSize
      });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div class={`
      display:grid
      grid-template-cols:${sizes.leftWidth}px|1fr|${sizes.rightWidth1}px|${sizes.rightWidth2}px
     
      height:calc(100vh-45px)
      width:100vw
      overflow:hidden
    `}
    //  grid-template-rows:1fr|${sizes.bottomHeight}px
    >
      <Panel onResize={createResizeHandler('leftWidth', true)} resizePosition="right">
        <FormElements />
      </Panel>

      <Panel style={{
        // 'background-color': '#ffffff',
        overflow: 'auto'
      }}>
        <TabBar />
        <PageViewComponent />
      </Panel>

      <Panel onResize={createResizeHandler('rightWidth1', true)} resizePosition="left">
        {/* <Show
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
          > */}
        <div
          class={`scrollbar-color:lightgrey {scrollbar-width:thin} bl:1|solid|lightgrey max-height:calc(100vh-${getGlobalStore(graph).P.navBarHeight + 2}px) overflow:auto p:5`}
        >
          <PropertiesContent />
        </div>
        {/* </Show> */}
      </Panel>

      <Panel onResize={createResizeHandler('rightWidth2', true)} resizePosition="left">
        <Settings />
      </Panel>

      {/* <Panel
        style={{ 'grid-column': '1 / span 4' }}
        onResize={createResizeHandler('bottomHeight', false)}
        resizePosition="top"
      >
        bottom panel
      </Panel> */}
      <DeleteConfirmation />
      <Show when={isResizing()}>
        <ResizeOverlay />
      </Show>
    </div>
  );
}
