import Resizable from '@corvu/resizable'
import { Component, createSignal, For, Show } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import { PageView } from "~/components/page_attr_render/PageView";
import { useDesignerFormIdContext, useDesignerLayoutStore } from "~/components/page_designer/context/LayoutContext";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { PageLayoutObject } from "../context/LayoutContext";
import { FormStoreObject } from "~/components/form/context/FormContext";

import { makePersisted } from '@solid-primitives/storage';
import { mergeVertexProperties } from '~/lib/graph/mutate/vertex';
import { getGlobalStore } from '~/lib/graph/get/sync/getGlobalStore';
import { ResizeOverlay } from "~/components/styled/ResizeOverlay";
import { createStore } from 'solid-js/store';
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
        ${props.position}:0px
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
  ref?: (el: HTMLDivElement) => void;
}

const Panel: Component<PanelProps> = (props) => {
  return (
    <div 
      ref={props.ref}
      style={{
        // 'background-color': '#f0f0f0',
        'border': '1px solid #ccc',
        position: 'relative',
        ...props.style
      }}
    >
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

interface Tab {
  id: string;
  title: string;
  content: string;
}

interface MainPanelData {
  id: string;
  tabs: Tab[];
  activeTab: string;
}

export function ResizableAltKey() {
  const [graph, setGraph] = useGraph()
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () => graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const [isResizing, setIsResizing] = createSignal(false);
  const [leftPanelRef, setLeftPanelRef] = createSignal<HTMLDivElement>();
  const [rightPanel1Ref, setRightPanel1Ref] = createSignal<HTMLDivElement>();
  const [rightPanel2Ref, setRightPanel2Ref] = createSignal<HTMLDivElement>();
  const [mainPanelRefs, setMainPanelRefs] = createSignal<{ [key: string]: HTMLDivElement }>({});

  const createResizeHandler = (key: 'leftWidth' | 'rightWidth1' | 'rightWidth2' | 'bottomHeight' | `mainPanel${string}`, panelRef: () => HTMLDivElement | undefined, isHorizontal: boolean) => (e: MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startPos = isHorizontal ? e.pageX : e.pageY;
    const panel = panelRef();
    if (!panel) return;
    
    const startWidth = panel.getBoundingClientRect().width;

    const onMouseMove = (e: MouseEvent) => {
      const currentPos = isHorizontal ? e.pageX : e.pageY;
      const diff = currentPos - startPos;

      // Determine if we're resizing from left/top (positive) or right/bottom (negative)
      const isPositiveResize = key === 'leftWidth' || key.startsWith('mainPanel');
      const newWidth = Math.max(100, startWidth + (isPositiveResize ? diff : -diff));

      mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
        [key]: newWidth
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
      grid-template-cols:${layoutStore().leftWidth}px|${layoutStore().mainPanel.map((panel) => layoutStore()[`mainPanel${panel}`] ?? '1fr').join('|')}${layoutStore().mainPanel.findIndex(panel => layoutStore()[`mainPanel${panel}`] === '1fr') !== -1 ? '|0px' : '|1fr'}|${layoutStore().rightWidth1}px|${layoutStore().rightWidth2}px
     
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
          onResize={createResizeHandler(`mainPanel${mainPanel}` as `mainPanel${string}`, () => mainPanelRefs()[`mainPanel${mainPanel}`], true)}
          >
            <TabBar />
            <PageViewComponent />
          </Panel>
        )}
      </For>
      <div/>

      <Panel 
        ref={setRightPanel1Ref}
        onResize={createResizeHandler('rightWidth1', rightPanel1Ref, true)} 
        resizePosition="left"
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
      >
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
