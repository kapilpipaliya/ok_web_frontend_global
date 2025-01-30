import { Component, createSignal, For, Show } from "solid-js";
import { useDesignerFormIdContext, useDesignerLayoutStore } from "~/components/page_designer/context/LayoutContext";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { PageLayoutObject } from "../context/LayoutContext";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { mergeVertexProperties } from '~/lib/graph/mutate/vertex';
import { getGlobalStore } from '~/lib/graph/get/sync/getGlobalStore';
import { ResizeOverlay } from "~/components/styled/ResizeOverlay";
import { FormElements } from './main_content/FormElements';
import { TabBar } from './main_content/TabBar';
import { PageViewComponent } from './main_content/PageViewComponent';
import { Settings } from './main_content/Settings';
import { PropertiesContent } from './main_content/PropertiesContent';
import { DeleteConfirmation } from './main_content/DeleteConfirmation';

export function RenderMainContent() {
  return <ResizableAltKey />
}
export default RenderMainContent;

interface ResizeHandleProps {
  onPointerDown: (e: PointerEvent) => void;
  isHorizontal?: boolean;
  position: 'left' | 'right' | 'top' | 'bottom';
  isResizing: boolean;
  resizeKey: string;
  activeResizeKey: string | null;
}

const ResizeHandle: Component<ResizeHandleProps> = (props) => {
  const isHorizontal = props.isHorizontal ?? true;
  const [isHovered, setIsHovered] = createSignal(false);

  return (
    <div
      class={`
        ${isHorizontal ? 'width:3px height:100%' : 'width:100% height:3px'}
        ${isHorizontal ? 'cursor:col-resize' : 'cursor:row-resize'}
        ${(isHovered() || (props.isResizing && props.resizeKey === props.activeResizeKey)) ? 'bg:gray-60' : 'bg:transparent'}
        z-index:1
        touch-action:none
        transition:background-color|0.2s
      `}
      onPointerDown={props.onPointerDown}
      onMouseEnter={() => !props.isResizing && setIsHovered(true)}
      onMouseLeave={() => !props.isResizing && setIsHovered(false)}
    />
  );
};

interface PanelProps {
  children: any;
  onResize?: (e: PointerEvent) => void;
  resizePosition?: 'left' | 'right' | 'top' | 'bottom';
  style?: any;
  ref?: (el: HTMLDivElement) => void;
  isResizing: boolean;
  resizeKey?: string;
  activeResizeKey: string | null;
}

const Panel: Component<PanelProps> = (props) => {
  return (
    <div 
      ref={props.ref}
      style={{
        // 'background-color': '#f0f0f0',
        'border': '1px solid #ccc',
        'display': 'grid',
        'grid-template-columns': props.resizePosition === 'left' ? '3px 1fr' : '1fr 3px',
        'grid-template-rows': props.resizePosition === 'top' ? '3px 1fr' : '1fr',
        ...props.style
      }}
    >
      <Show when={props.resizePosition === 'left' && props.onResize}>
        <ResizeHandle
          onPointerDown={props.onResize!}
          position={props.resizePosition!}
          isHorizontal={props.resizePosition !== 'top'}
          isResizing={props.isResizing}
          resizeKey={props.resizeKey || ''}
          activeResizeKey={props.activeResizeKey}
        />
      </Show>
      <div style={{ "overflow": "auto" }}>
        {props.children}
      </div>
      <Show when={props.resizePosition !== 'left' && props.onResize}>
        <ResizeHandle
          onPointerDown={props.onResize!}
          position={props.resizePosition || 'right'}
          isHorizontal={props.resizePosition !== 'top'}
          isResizing={props.isResizing}
          resizeKey={props.resizeKey || ''}
          activeResizeKey={props.activeResizeKey}
        />
      </Show>
    </div>
  );
};

export function ResizableAltKey() {
  const [graph, setGraph] = useGraph()
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const [isResizing, setIsResizing] = createSignal(false);
  const [activeResizeKey, setActiveResizeKey] = createSignal<string | null>(null);
  const [leftPanelRef, setLeftPanelRef] = createSignal<HTMLDivElement>();
  const [rightPanel1Ref, setRightPanel1Ref] = createSignal<HTMLDivElement>();
  const [rightPanel2Ref, setRightPanel2Ref] = createSignal<HTMLDivElement>();
  const [mainPanelRefs, setMainPanelRefs] = createSignal<{ [key: string]: HTMLDivElement }>({});

  const createResizeHandler = (key: 'leftWidth' | 'rightWidth1' | 'rightWidth2' | 'bottomHeight' | `mainPanel${string}Width`, panelRef: () => HTMLDivElement | undefined, isHorizontal: boolean) => (e: PointerEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setActiveResizeKey(key);
    const startPos = isHorizontal ? e.pageX : e.pageY;
    const panel = panelRef();
    if (!panel) return;
    
    const startWidth = panel.getBoundingClientRect().width;
    const pointerId = e.pointerId;

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const currentPos = isHorizontal ? e.pageX : e.pageY;
      const diff = currentPos - startPos;

      // Determine if we're resizing from left/top (positive) or right/bottom (negative)
      const isPositiveResize = key === 'leftWidth' || key.startsWith('mainPanel');
      const newWidth = Math.max(100, startWidth + (isPositiveResize ? diff : -diff));

      mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
        [key]: newWidth
      });
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      setIsResizing(false);
      setActiveResizeKey(null);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
    };

    panel.setPointerCapture(pointerId);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);
  };

  return (
    <div class={`
      display:grid
      grid-template-cols:${layoutStore().leftWidth}px|${layoutStore().mainPanel.map((panel) => layoutStore()[`mainPanel${panel}Width`] ?? '1fr').join('|')}${layoutStore().mainPanel.findIndex(panel => layoutStore()[`mainPanel${panel}Width`] === '1fr') !== -1 ? '|0px' : '|1fr'}|${layoutStore().rightWidth1}px|${layoutStore().rightWidth2}px
     
      height:calc(100vh-45px)
      width:100vw
      
    `}
    // overflow:hidden
    //  grid-template-rows:1fr|${sizes.bottomHeight}px
    >
      <Panel 
        ref={setLeftPanelRef}
        onResize={createResizeHandler('leftWidth', leftPanelRef, true)} 
        resizePosition="right"
        isResizing={isResizing()}
        resizeKey="leftWidth"
        activeResizeKey={activeResizeKey()}
      >
        <FormElements />
      </Panel>

      <For each={layoutStore().mainPanel}>
        {(mainPanel) => (
          <Panel style={{
            // 'background-color': '#ffffff',
            overflow: 'auto'
          }}
          ref={(el) => setMainPanelRefs((prev) => ({ ...prev, [`mainPanel${mainPanel}`]: el }))}
          // onResize={index() < layoutStore().mainPanel.length - 1 ? createResizeHandler(`mainPanel${index()}` as `mainPanel${string}`, () => mainPanelRefs()[`mainPanel${index()}`], true) : undefined}
          onResize={createResizeHandler(`mainPanel${mainPanel}Width` as `mainPanel${string}Width`, () => mainPanelRefs()[`mainPanel${mainPanel}`], true)}
          isResizing={isResizing()}
          resizeKey={`mainPanel${mainPanel}Width`}
          activeResizeKey={activeResizeKey()}
          >
            <TabBar mainPanel={mainPanel} />
            <PageViewComponent mainPanel={mainPanel} />
          </Panel>
        )}
      </For>
      <div/>

      <Panel 
        ref={setRightPanel1Ref}
        onResize={createResizeHandler('rightWidth1', rightPanel1Ref, true)} 
        resizePosition="left"
        isResizing={isResizing()}
        resizeKey="rightWidth1"
        activeResizeKey={activeResizeKey()}
      >
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

      <Panel 
        ref={setRightPanel2Ref}
        onResize={createResizeHandler('rightWidth2', rightPanel2Ref, true)} 
        resizePosition="left"
        isResizing={isResizing()}
        resizeKey="rightWidth2"
        activeResizeKey={activeResizeKey()}
      >
        <Settings />
      </Panel>

      {/* <Panel
        style={{ 'grid-column': '1 / span 4' }}
        onResize={createResizeHandler('bottomHeight',()=>undefined, false)}
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
