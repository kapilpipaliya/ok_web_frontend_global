import { type Component, createSignal, For, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { ResizeOverlay } from "~/components/styled/ResizeOverlay";
import { IconButton } from "~/components/styled/IconButton";
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
      css={`return \`._id {
        width: ${isHorizontal ? "3px" : "100%"};
        height: ${isHorizontal ? "100%" : "3px"};
        cursor: ${isHorizontal ? "col-resize" : "row-resize"};
        background-color: ${isHovered() || (props.isResizing && props.resizeKey === props.activeResizeKey) ? "${args.theme.var.color.text_light_300}" : "transparent"};
        transition: background-color 0.2s;
        height: 100%;
      }}\`;`}
      onMouseEnter={() => !props.isResizing && setIsHovered(true)}
      onMouseLeave={() => !props.isResizing && setIsHovered(false)}
      onPointerDown={props.onPointerDown}
    />
  );
};

interface PanelProps {
  activeResizeKey: null | string;
  children: any;
  collapsed?: boolean;
  isResizing: boolean;
  onExpand?: () => void;
  onResize?: (e: PointerEvent) => void;
  onResizeLeft?: (e: PointerEvent) => void;
  onResizeRight?: (e: PointerEvent) => void;
  onToggleCollapse?: () => void;
  ref?: (el: HTMLDivElement) => void;
  resizeKey?: string;
  resizeKeyLeft?: string;
  resizeKeyRight?: string;
  resizePosition?: "bottom" | "left" | "right" | "top";
  scrollContent?: boolean;
  style?: any;
  title?: string;
}

const Panel: Component<PanelProps> = (props) => {
  const leftResizeHandler = () =>
    props.collapsed
      ? undefined
      : (props.onResizeLeft ??
        (props.onResize && props.resizePosition === "left"
          ? props.onResize
          : undefined));

  const rightResizeHandler = () =>
    props.collapsed
      ? undefined
      : (props.onResizeRight ??
        (props.onResize &&
        props.resizePosition !== "left" &&
        props.resizePosition !== "top"
          ? props.onResize
          : undefined));

  const gridTemplateColumns = () => {
    const hasLeft = !!leftResizeHandler();
    const hasRight = !!rightResizeHandler();
    if (hasLeft && hasRight) {
      return "3px 1fr 3px";
    }
    if (hasLeft) {
      return "3px 1fr";
    }
    if (hasRight) {
      return "1fr 3px";
    }
    return "1fr";
  };

  const Content = () => {
    return (
      <Show
        fallback={
          <As
            as="div"
            css={
              props.scrollContent === false
                ? `return \`._id {
                    min-height: 0;
                    height: 100%;
                    overflow: hidden;
                  }\`;`
                : [
                    STYLES.verticalOverflowCss,
                    `return \`._id { min-height: 0; }\`;`,
                  ]
            }
          >
            {props.children}
          </As>
        }
        when={props.title}
      >
        <As
          as="div"
          css={`return \`._id {
          display: grid;
          grid-template-rows: auto 1fr;
          height: 100%;
        }}\`;`}
        >
          <As
            as="div"
            css={`return \`._id {
            background: \${args.theme.var.color.background_light_100};
            border-bottom: 1px solid \${args.theme.var.color.border};
            padding: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
            min-height: 1rem;
            cursor: ${props.collapsed ? "pointer" : "default"};
            overflow: hidden;
          }}\`;`}
            onClick={() => {
              if (props.collapsed) {
                props.onExpand?.();
              }
            }}
          >
            <Show
              fallback={
                <As
                  as="span"
                  css={`return \`._id {
                    writing-mode: vertical-rl;
                    transform: rotate(180deg);
                    font-weight: 600;
                    font-size: inherit;
                    white-space: nowrap;
                    user-select: none;
                  }\`;`}
                >
                  {props.title}
                </As>
              }
              when={!props.collapsed}
            >
              <As
                as="h1"
                css={"return `._id { font-weight: 600; font-size: inherit; flex: 1; margin: 0; }`;"}
              >
                {props.title}
              </As>
              <Show when={props.onToggleCollapse}>
                <IconButton
                  icon="ph:caret-left"
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    props.onToggleCollapse?.();
                  }}
                  size={18}
                  title="Collapse panel"
                />
              </Show>
            </Show>
          </As>
          <Show when={!props.collapsed}>
            <As
              as="div"
              css={[
                STYLES.verticalOverflowCss,
                `return \`._id { min-height: 0; }\`;`,
              ]}
            >
              {props.children}
            </As>
          </Show>
        </As>
      </Show>
    );
  };

  return (
    <As
      as="div"
      css={[
        `return \`._id {
          border: 1px solid \${args.theme.var.color.border};
          display: grid;
          grid-template-columns: ${gridTemplateColumns()};
          grid-template-rows: ${props.resizePosition === "top" ? "3px 1fr" : "100%"};
          height: 100%;
          min-width: 0;
          overflow: hidden;
        }\`;`,
      ]}
      ref={props.ref}
      style={props.style}
    >
      <div style={{ display: leftResizeHandler() ? "block" : "none" }}>
        <ResizeHandle
          activeResizeKey={props.activeResizeKey}
          isHorizontal={props.resizePosition !== "top"}
          isResizing={props.isResizing}
          onPointerDown={leftResizeHandler()!}
          position="left"
          resizeKey={props.resizeKeyLeft || props.resizeKey || ""}
        />
      </div>
      <Content />
      <div style={{ display: rightResizeHandler() ? "block" : "none" }}>
        <ResizeHandle
          activeResizeKey={props.activeResizeKey}
          isHorizontal={props.resizePosition !== "top"}
          isResizing={props.isResizing}
          onPointerDown={rightResizeHandler()!}
          position="right"
          resizeKey={props.resizeKeyRight || props.resizeKey || ""}
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

  const getGridTemplateColumns = () => {
    const layout = layoutStore();
    const columns: string[] = [];

    if (layout.isComponentsOpen) {
      columns.push(`${layout.componentsWidth}px`);
    }

    if (layout.isSettingsOpen) {
      columns.push(`${layout.settingsWidth}px`);
    }

    if (layout.isPropertiesOpen) {
      columns.push(
        layout.isPropertiesCollapsed ? "1rem" : `${layout.propertiesWidth}px`,
      );
    }

    if (layout.isAiOpen) {
      columns.push(`${layout.aiWidth}px`);
    }

    if (layout.mainPanel) {
      const mainPanelColumns = layout.mainPanel.map((panel) => {
        const width = layout[`mainPanel${panel}Width`];
        return typeof width === "number"
          ? `${width}px`
          : "minmax(400px, 1fr)";
      });
      columns.push(...mainPanelColumns);
    }

    return columns.join(" ");
  };

  const [isResizing, setIsResizing] = createSignal(false);
  const [activeResizeKey, setActiveResizeKey] = createSignal<null | string>(
    null,
  );
  const [componentsPanelRef, setComponentsPanelRef] =
    createSignal<HTMLDivElement>();
  const [aiPanelRef, setAiPanelRef] = createSignal<HTMLDivElement>();
  const [propertiesPanelRef, setPropertiesPanelRef] =
    createSignal<HTMLDivElement>();
  const [settingsPanelRef, setSettingsPanelRef] =
    createSignal<HTMLDivElement>();
  const [mainPanelRefs, setMainPanelRefs] = createSignal<{
    [key: string]: HTMLDivElement;
  }>({});

  const [showGraphView, setShowGraphView] = createSignal(false);

  const createResizeHandler =
    (
      key:
        | "bottomHeight"
        | "componentsWidth"
        | "aiWidth"
        | "propertiesWidth"
        | "settingsWidth"
        | `mainPanel${string}Width`,
      panelRef: () => HTMLDivElement | undefined,
      isHorizontal: boolean,
      growOnDragRight = key === "componentsWidth" || key.startsWith("mainPanel"),
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

        const newWidth = Math.max(
          100,
          startWidth + (growOnDragRight ? diff : -diff),
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

  const togglePropertiesCollapse = () => {
    const layout = layoutStore();
    if (layout.isPropertiesCollapsed) {
      mergeVertexProperties<PageLayoutObject>(
        0,
        layoutStoreId,
        graph,
        setGraph,
        {
          isPropertiesCollapsed: false,
          propertiesWidth: layout.propertiesExpandedWidth,
        },
      );
    } else {
      mergeVertexProperties<PageLayoutObject>(
        0,
        layoutStoreId,
        graph,
        setGraph,
        {
          isPropertiesCollapsed: true,
          propertiesExpandedWidth: layout.propertiesWidth,
        },
      );
    }
  };

  const expandProperties = () => {
    const layout = layoutStore();
    if (!layout.isPropertiesCollapsed) {
      return;
    }
    mergeVertexProperties<PageLayoutObject>(0, layoutStoreId, graph, setGraph, {
      isPropertiesCollapsed: false,
      propertiesWidth: layout.propertiesExpandedWidth,
    });
  };

  return (
    <As
      as="div"
      css={`return \`._id {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100vh;
        overflow: hidden;
      }\`;`}
    >
      <HeaderRow
        css={`return \`._id {
          align-items: center;
          flex-shrink: 0;
        }}\`;`}
      />

      <As
        as="div"
        css={[
          STYLES.horizontalOverflowCss,
          `return \`._id {
        flex: 1;
        min-width: 0;
        min-height: 0;
      }\`;`,
        ]}
      >
        <As
          as="div"
          css={`return \`._id {
          display: grid;
          grid-template-columns: ${getGridTemplateColumns()};
          width: max-content;
          min-width: 100%;
          height: 100%;
        }\`;`}
        >
        <As
          as="div"
          css={STYLES.panelCellCss}
          style={{
            display: layoutStore().isComponentsOpen ? "block" : "none",
          }}
        >
          <Panel
            activeResizeKey={activeResizeKey()}
            isResizing={isResizing()}
            onResize={createResizeHandler(
              "componentsWidth",
              componentsPanelRef,
              true,
            )}
            ref={setComponentsPanelRef}
            resizeKey="componentsWidth"
            resizePosition="right"
          >
            <FormElements />
          </Panel>
        </As>

        <As
          as="div"
          css={STYLES.panelCellCss}
          style={{ display: layoutStore().isSettingsOpen ? "block" : "none" }}
        >
          <Panel
            activeResizeKey={activeResizeKey()}
            isResizing={isResizing()}
            onResize={createResizeHandler(
              "settingsWidth",
              settingsPanelRef,
              true,
              true,
            )}
            ref={setSettingsPanelRef}
            resizeKey="settingsWidth"
            resizePosition="right"
          >
            <SettingTabs />
          </Panel>
        </As>

        <As
          as="div"
          css={STYLES.panelCellCss}
          style={{
            display: layoutStore().isPropertiesOpen ? "block" : "none",
          }}
        >
          <Panel
            activeResizeKey={activeResizeKey()}
            collapsed={layoutStore().isPropertiesCollapsed}
            isResizing={isResizing()}
            onExpand={expandProperties}
            onResize={createResizeHandler(
              "propertiesWidth",
              propertiesPanelRef,
              true,
              true,
            )}
            onToggleCollapse={togglePropertiesCollapse}
            ref={setPropertiesPanelRef}
            resizeKey="propertiesWidth"
            resizePosition="right"
            title="Properties"
          >
            <PropertiesContent />
          </Panel>
        </As>

        <As
          as="div"
          css={STYLES.panelCellCss}
          style={{ display: layoutStore().isAiOpen ? "block" : "none" }}
        >
          <Panel
            activeResizeKey={activeResizeKey()}
            isResizing={isResizing()}
            onResize={createResizeHandler("aiWidth", aiPanelRef, true, true)}
            ref={setAiPanelRef}
            resizeKey="aiWidth"
            resizePosition="right"
            title="AI Content Generator"
          >
            <UseObjectAIPanel />
          </Panel>
        </As>

        <For each={layoutStore().mainPanel}>
          {(mainPanel) => (
            <As as="div" css={STYLES.panelCellCss}>
              <Panel
                activeResizeKey={activeResizeKey()}
                isResizing={isResizing()}
                onResizeLeft={createResizeHandler(
                  `mainPanel${mainPanel}Width` as `mainPanel${string}Width`,
                  () => mainPanelRefs()[`mainPanel${mainPanel}`],
                  true,
                  false,
                )}
                onResizeRight={createResizeHandler(
                  `mainPanel${mainPanel}Width` as `mainPanel${string}Width`,
                  () => mainPanelRefs()[`mainPanel${mainPanel}`],
                  true,
                  true,
                )}
                ref={(el) =>
                  setMainPanelRefs((prev) => ({
                    ...prev,
                    [`mainPanel${mainPanel}`]: el,
                  }))
                }
                resizeKey={`mainPanel${mainPanel}Width`}
                resizeKeyLeft={`mainPanel${mainPanel}Width`}
                resizeKeyRight={`mainPanel${mainPanel}Width`}
                scrollContent={false}
              >
                <As
                  as="div"
                  css={`return \`._id {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    min-height: 0;
                    overflow: hidden;
                  }\`;`}
                >
                  <As as="div" css={`return \`._id { flex-shrink: 0; }\`;`}>
                    <TabBar mainPanel={mainPanel} />
                  </As>
                  <As
                    as="div"
                    css={`return \`._id {
                      flex: 1;
                      min-height: 0;
                      overflow: hidden;
                    }\`;`}
                  >
                    <PageViewComponent mainPanel={mainPanel} />
                  </As>
                </As>
              </Panel>
            </As>
          )}
        </For>
        </As>
      </As>

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
