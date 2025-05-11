import { type Component, createSignal, For, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { ResizeOverlay } from "~/components/styled/ResizeOverlay";
import {
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { SettingTabs } from "~/features/page_designer/settings/SettingTabs";
import { GraphView } from "~/pages/debug/GraphView";
import { STYLES } from "~/pages/settings/constants";

import type { PageLayoutObject } from "../context/LayoutContext";

import { UseObjectAIPanel } from "../chat/use-object/UseObjectAIPanel";
import { HeaderRow } from "../header/header_row/HeaderRow";
import { DeleteConfirmation } from "./main_content/DeleteConfirmation";
import { FormElements } from "./main_content/FormElements";
import { PageViewComponent } from "./main_content/PageViewComponent";
import { PropertiesContent } from "./main_content/PropertiesContent";
import { TabBar } from "./main_content/TabBar";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

interface ResizeHandleProps {
  activeResizeKey: null | string;
  isHorizontal?: boolean;
  isResizing: boolean;
  onPointerDown: (e: PointerEvent) => void;
  position: "bottom" | "left" | "right" | "top";
  resizeKey: string;
}

const ResizeHandle: Component<ResizeHandleProps> = (props) => {
  const isHorizontal = props.isHorizontal ?? true;
  const [isHovered, setIsHovered] = createSignal(false);

  return (
    <As
      as="div"
      css={css`
        width: ${isHorizontal ? "3px" : "100%"};
        height: ${isHorizontal ? "100%" : "3px"};
        cursor: ${isHorizontal ? "col-resize" : "row-resize"};
        background-color: ${isHovered() || (props.isResizing && props.resizeKey === props.activeResizeKey) ? "rgb(163,163,163)" : "transparent"};
        touch-action: none;
        transition: background-color 0.2s;
        height: 100%;
      `}
      onMouseEnter={() => !props.isResizing && setIsHovered(true)}
      onMouseLeave={() => !props.isResizing && setIsHovered(false)}
      onPointerDown={props.onPointerDown}
    />
  );
};

interface PanelProps {
  activeResizeKey: null | string;
  children: any;
  isResizing: boolean;
  onResize?: (e: PointerEvent) => void;
  ref?: (el: HTMLDivElement) => void;
  resizeKey?: string;
  resizePosition?: "bottom" | "left" | "right" | "top";
  style?: any;
  title?: string;
}

const Panel: Component<PanelProps> = (props) => {
  const Content = () => {
    return (
      <Show
        fallback={
          // if overflow is not set, the resize handle will not work
          <As as="div" css={STYLES.overflowCss}>
            {props.children}
          </As>
        }
        when={props.title}
      >
        <As
          as="div"
          css={css`
          display: grid;
          grid-template-rows: auto 1fr;
          height: 100%;
        `}
        >
          <As
            as="div"
            css={css`
            background: rgb(243,244,246);
            border-bottom: 1px solid rgb(229,231,235);
            padding: 4px;
          `}
          >
            <As as="h1" css={css`font-weight: 600; font-size: inherit;`}>
              {props.title}
            </As>
          </As>
          <As as="div" css={STYLES.overflowCss}>
            {props.children}
          </As>
        </As>
      </Show>
    );
  };
  return (
    <As
      as="div"
      css={STYLES.overflowCss}
      ref={props.ref}
      style={{
        // 'background-color': '#f0f0f0',
        border: "1px solid #ccc",
        display: "grid",
        "grid-template-columns":
          props.resizePosition === "left" ? "3px 1fr" : "1fr 3px",
        "grid-template-rows":
          props.resizePosition === "top" ? "3px 1fr" : "100%",
        height: "100%",
        ...props.style,
      }}
    >
      <div
        style={{
          display:
            props.resizePosition === "left" && props.onResize
              ? "block"
              : "none",
        }}
      >
        <ResizeHandle
          activeResizeKey={props.activeResizeKey}
          isHorizontal={props.resizePosition !== "top"}
          isResizing={props.isResizing}
          onPointerDown={props.onResize!}
          position={props.resizePosition!}
          resizeKey={props.resizeKey || ""}
        />
      </div>
      <Content />
      <div
        style={{
          display:
            props.resizePosition !== "left" && props.onResize
              ? "block"
              : "none",
        }}
      >
        <ResizeHandle
          activeResizeKey={props.activeResizeKey}
          isHorizontal={props.resizePosition !== "top"}
          isResizing={props.isResizing}
          onPointerDown={props.onResize!}
          position={props.resizePosition || "right"}
          resizeKey={props.resizeKey || ""}
        />
      </div>
    </As>
  );
};

export function RenderMainContent() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () =>
    (graph.vertexes[layoutStoreId]?.P as PageLayoutObject) || {};
  const formStoreId = useDesignerFormIdContext();
  const _formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const [isResizing, setIsResizing] = createSignal(false);
  const [activeResizeKey, setActiveResizeKey] = createSignal<null | string>(
    null,
  );
  const [leftPanelRef, setLeftPanelRef] = createSignal<HTMLDivElement>();
  const [rightPanel0Ref, setRightPanel0Ref] = createSignal<HTMLDivElement>();
  const [rightPanel1Ref, setRightPanel1Ref] = createSignal<HTMLDivElement>();
  const [rightPanel2Ref, setRightPanel2Ref] = createSignal<HTMLDivElement>();
  const [mainPanelRefs, setMainPanelRefs] = createSignal<{
    [key: string]: HTMLDivElement;
  }>({});

  const [showGraphView, setShowGraphView] = createSignal(false);

  const createResizeHandler =
    (
      key:
        | "bottomHeight"
        | "leftWidth"
        | "rightWidth0"
        | "rightWidth1"
        | "rightWidth2"
        | `mainPanel${string}Width`,
      panelRef: () => HTMLDivElement | undefined,
      isHorizontal: boolean,
    ) =>
    (e: PointerEvent) => {
      e.preventDefault();
      setIsResizing(true);
      setActiveResizeKey(key);
      const startPos = isHorizontal ? e.pageX : e.pageY;
      const panel = panelRef();
      if (!panel) {
        return;
      }

      const startWidth = panel.getBoundingClientRect().width;
      const pointerId = e.pointerId;

      const onPointerMove = (e: PointerEvent) => {
        if (e.pointerId !== pointerId) {
          return;
        }
        const currentPos = isHorizontal ? e.pageX : e.pageY;
        const diff = currentPos - startPos;

        // Determine if we're resizing from left/top (positive) or right/bottom (negative)
        const isPositiveResize =
          key === "leftWidth" || key.startsWith("mainPanel");
        const newWidth = Math.max(
          100,
          startWidth + (isPositiveResize ? diff : -diff),
        );

        mergeVertexProperties<PageLayoutObject>(
          0,
          layoutStoreId,
          graph,
          setGraph,
          {
            [key]: newWidth,
          },
        );
      };

      const onPointerUp = (e: PointerEvent) => {
        if (e.pointerId !== pointerId) {
          return;
        }
        setIsResizing(false);
        setActiveResizeKey(null);
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointercancel", onPointerUp);
      };

      panel.setPointerCapture(pointerId);
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
      document.addEventListener("pointercancel", onPointerUp);
    };

  return (
    <As
      as="div"
      css={css`
        display: grid;
        grid-template-columns: ${layoutStore().isLeftOpen ? `${layoutStore().leftWidth}px ` : ""}${layoutStore()
          .mainPanel?.map((panel) => {
            const width = layoutStore()[`mainPanel${panel}Width`];
            return typeof width === "number" ? `${width}px` : (width ?? "1fr");
          })
          .join(
            " ",
          )}${layoutStore().mainPanel?.findIndex((panel) => layoutStore()[`mainPanel${panel}Width`] === "1fr") !== -1 ? " 0px" : " 1fr"}${layoutStore().isRight0Open ? ` ${layoutStore().rightWidth0}px` : ""}${layoutStore().isRight1Open ? ` ${layoutStore().rightWidth1}px` : ""}${layoutStore().isRight2Open ? ` ${layoutStore().rightWidth2}px` : ""};
        width: 100vw;
        height: 100vh;
        grid-template-rows: 38px 1fr;
      `}
      // overflow:hidden
      //  grid-template-rows:1fr|${sizes.bottomHeight}px
    >
      <HeaderRow
        css={css`
          align-items: center;
        `}
        style={{
          "grid-column": `1 / span ${layoutStore().mainPanel?.length + 1 + 4}`,
        }}
      />

      <As
        as="div"
        css={STYLES.overflowCss}
        style={{ display: layoutStore().isLeftOpen ? "block" : "none" }}
      >
        <Panel
          activeResizeKey={activeResizeKey()}
          isResizing={isResizing()}
          onResize={createResizeHandler("leftWidth", leftPanelRef, true)}
          ref={setLeftPanelRef}
          resizeKey="leftWidth"
          resizePosition="right"
        >
          <FormElements />
        </Panel>
      </As>

      <For each={layoutStore().mainPanel}>
        {(mainPanel) => (
          <Panel
            activeResizeKey={activeResizeKey()}
            isResizing={isResizing()}
            // onResize={index() < layoutStore().mainPanel.length - 1 ? createResizeHandler(`mainPanel${index()}` as `mainPanel${string}`, () => mainPanelRefs()[`mainPanel${index()}`], true) : undefined}
            onResize={createResizeHandler(
              `mainPanel${mainPanel}Width` as `mainPanel${string}Width`,
              () => mainPanelRefs()[`mainPanel${mainPanel}`],
              true,
            )}
            ref={(el) =>
              setMainPanelRefs((prev) => ({
                ...prev,
                [`mainPanel${mainPanel}`]: el,
              }))
            }
            resizeKey={`mainPanel${mainPanel}Width`}
            style={
              {
                // 'background-color': '#ffffff',
              }
            }
          >
            <TabBar mainPanel={mainPanel} />
            <PageViewComponent mainPanel={mainPanel} />
          </Panel>
        )}
      </For>

      <div />

      <As
        as="div"
        css={STYLES.overflowCss}
        style={{ display: layoutStore().isRight0Open ? "block" : "none" }}
      >
        <Panel
          activeResizeKey={activeResizeKey()}
          isResizing={isResizing()}
          onResize={createResizeHandler("rightWidth0", rightPanel0Ref, true)}
          ref={setRightPanel0Ref}
          resizeKey="rightWidth0"
          resizePosition="left"
          title="AI Content Generator"
        >
          <UseObjectAIPanel />
        </Panel>
      </As>

      <As
        as="div"
        css={STYLES.overflowCss}
        style={{ display: layoutStore().isRight1Open ? "block" : "none" }}
      >
        <Panel
          activeResizeKey={activeResizeKey()}
          isResizing={isResizing()}
          onResize={createResizeHandler("rightWidth1", rightPanel1Ref, true)}
          ref={setRightPanel1Ref}
          resizeKey="rightWidth1"
          resizePosition="left"
          title="Properties"
        >
          {/* <Show
            fallback={
              <div css={css`
  border-left: 1 solid lightgrey;
  padding-left: 8px;
  padding-top: 8px;
`}>
                Element is not selected
              </As>
            }
            when={
              formStoreVertex()?.P.selectedId !== -1 &&
              graph.vertexes[formStoreVertex()?.P.selectedId] &&
              graph.vertexes[formStoreVertex()?.P.selectedId].L?.[0]?.endsWith("Attr")
            }
          > */}
          <PropertiesContent />
          {/* </Show> */}
        </Panel>
      </As>

      <As
        as="div"
        css={STYLES.overflowCss}
        style={{ display: layoutStore().isRight2Open ? "block" : "none" }}
      >
        <Panel
          activeResizeKey={activeResizeKey()}
          isResizing={isResizing()}
          onResize={createResizeHandler("rightWidth2", rightPanel2Ref, true)}
          ref={setRightPanel2Ref}
          resizeKey="rightWidth2"
          resizePosition="left"
        >
          <SettingTabs />
        </Panel>
      </As>

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
      <button
        onClick={() => setShowGraphView(!showGraphView())}
        style={{ display: "none" }}
      >
        Toggle GraphView
      </button>
      <Show when={showGraphView()}>
        <GraphView />
      </Show>
    </As>
  );
}

export default RenderMainContent;
