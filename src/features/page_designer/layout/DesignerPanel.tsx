import { type Component, type JSX, Show } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import type { SetStoreFunction } from "solid-js/store";

import { IconButton } from "~/components/styled/IconButton";
import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { As } from "~/components/As";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Id } from "~/lib/graph/type/id";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";
import { headerIconButtonCss, STYLES } from "~/pages/settings/constants";
import { createAxisResizeHandler } from "~/lib/resizable/createAxisResizeHandler";
import { DesignerResizeHandle } from "~/lib/resizable/DesignerResizeHandle";
import { useDesignerResizeTrackSize } from "~/lib/resizable/useDesignerResizeTrackSize";
import { createTapClickHandler } from "~/lib/event/rowPointer";
import { useGraph } from "~/lib/graph/context/UseGraph";

export interface DesignerPanelProps {
  activeResizeKey: null | string;
  children: any;
  collapsed?: boolean;
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
  titleActions?: JSX.Element;
  titleIcon?: string;
}

export const DesignerPanel: Component<DesignerPanelProps> = (props) => {
  const [graph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const isResizingDisabled = () =>
    !!(graph.vertexes[layoutStoreId]?.P as PageLayoutObject | undefined)
      ?.isResizingDisabled;
  const resizeTrackSize = useDesignerResizeTrackSize();
  const trackSize = () => `${resizeTrackSize()}px`;

  const leftResizeHandler = () =>
    props.collapsed || isResizingDisabled()
      ? undefined
      : (props.onResizeLeft ??
        (props.onResize && props.resizePosition === "left"
          ? props.onResize
          : undefined));

  const rightResizeHandler = () =>
    props.collapsed || isResizingDisabled()
      ? undefined
      : (props.onResizeRight ??
        (props.onResize &&
        props.resizePosition !== "left" &&
        props.resizePosition !== "top"
          ? props.onResize
          : undefined));

  const gridTemplateColumns = () => {
    const track = trackSize();
    const hasLeft = !!leftResizeHandler();
    const hasRight = !!rightResizeHandler();
    if (hasLeft && hasRight) {
      return `${track} 1fr ${track}`;
    }
    if (hasLeft) {
      return `${track} 1fr`;
    }
    if (hasRight) {
      return `1fr ${track}`;
    }
    return "1fr";
  };

  const resizeAxis = () => (props.resizePosition === "top" ? "y" : "x");

  // Android Chrome swallows click on the narrow collapsed strip, so expand on tap.
  const expandTap = createTapClickHandler(() => props.onExpand?.());

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
                    STYLES.overflowCss,
                    "return `._id { min-height: 0; min-width: 0; }`;",
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
          grid-template-rows: ${props.collapsed ? "1fr" : "auto 1fr"};
          height: 100%;
          min-height: 0;
          overflow: hidden;
        }}\`;`}
        >
          <As
            as="div"
            css={`return \`._id {
            background: \${t.var.color.background_light_100};
            border-bottom: 1px solid \${t.var.color.border};
            padding: 4px;
            display: flex;
            align-items: ${props.collapsed ? "flex-start" : "center"};
            justify-content: center;
            gap: 4px;
            min-height: 1rem;
            cursor: ${props.collapsed ? "pointer" : "default"};
            overflow: hidden;
            ${props.collapsed ? "height: 100%; touch-action: manipulation;" : ""}
          }}\`;`}
            onClick={(event: MouseEvent) => {
              if (props.collapsed) {
                expandTap.onClick(event);
              }
            }}
            onPointerDown={(event: PointerEvent) => {
              if (props.collapsed) {
                expandTap.onPointerDown(event);
              }
            }}
            onPointerUp={(event: PointerEvent) => {
              if (props.collapsed) {
                expandTap.onPointerUp(event);
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
              <Show when={props.titleIcon}>
                <Icon icon={props.titleIcon!} />
              </Show>
              <As
                as="h1"
                css={
                  "return `._id { font-weight: 600; font-size: inherit; flex: 1; margin: 0; }`;"
                }
              >
                {props.title}
              </As>
              {props.titleActions}
              <Show when={props.onToggleCollapse}>
                <IconButton
                  css={[
                    headerIconButtonCss,
                    "return `._id { flex-shrink: 0; }`;",
                  ]}
                  icon="ph:caret-left"
                  iconCss={`return \`._id { color: \${t.var.color.text_light_300}; }\`;`}
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
              css={
                props.scrollContent === false
                  ? `return \`._id {
                      min-height: 0;
                      min-width: 0;
                      height: 100%;
                      overflow: hidden;
                    }\`;`
                  : [
                      STYLES.overflowCss,
                      "return `._id { min-height: 0; min-width: 0; }`;",
                    ]
              }
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
          border: 1px solid \${t.var.color.border};
          display: grid;
          grid-template-columns: ${gridTemplateColumns()};
          grid-template-rows: ${props.resizePosition === "top" ? `${trackSize()} 1fr` : "100%"};
          height: 100%;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
        }\`;`,
      ]}
      ref={props.ref}
      style={props.style}
    >
      <Show when={leftResizeHandler()}>
        <DesignerResizeHandle
          active={
            props.activeResizeKey ===
            (props.resizeKeyLeft || props.resizeKey || "")
          }
          axis={resizeAxis()}
          onPointerDown={leftResizeHandler()!}
        />
      </Show>
      <As
        as="div"
        css={`return \`._id {
          min-width: 0;
          min-height: 0;
          height: 100%;
          overflow: hidden;
        }\`;`}
      >
        <Content />
      </As>
      <Show when={rightResizeHandler()}>
        <DesignerResizeHandle
          active={
            props.activeResizeKey ===
            (props.resizeKeyRight || props.resizeKey || "")
          }
          axis={resizeAxis()}
          onPointerDown={rightResizeHandler()!}
        />
      </Show>
    </As>
  );
};

export type PanelWidthKey =
  | "layoutTreeWidth"
  | "propertiesWidth"
  | "settingsWidth"
  | "componentsWidth"
  | "pagesWidth"
  | "functionsWidth"
  | "aiWidth"
  | `mainPanel${string}Width`;

export function createPanelResizeHandler<T extends Record<string, unknown>>(
  key: string,
  storeId: Id | (() => Id | undefined),
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  panelRef: () => HTMLDivElement | undefined,
  setIsResizing: (value: boolean) => void,
  setActiveResizeKey: (value: null | string) => void,
  growOnDragRight = key === "layoutTreeWidth" ||
    key === "propertiesWidth" ||
    key === "settingsWidth" ||
    key === "aiWidth" ||
    key.startsWith("mainPanel"),
) {
  return (e: PointerEvent) => {
    const panel = panelRef();
    if (!panel) {
      return;
    }

    createAxisResizeHandler({
      axis: "x",
      getStartSize: () => panel.getBoundingClientRect().width,
      growOnDragPositive: growOnDragRight,
      minSize: 100,
      onEnd: () => {
        setIsResizing(false);
        setActiveResizeKey(null);
      },
      onResize: (newWidth) => {
        const resolvedStoreId =
          typeof storeId === "function" ? storeId() : storeId;
        if (!resolvedStoreId) {
          return;
        }
        mergeVertexProperties<T>(0, resolvedStoreId, graph, setGraph, {
          [key]: newWidth,
        } as Partial<T>);
      },
      onStart: () => {
        setIsResizing(true);
        setActiveResizeKey(key);
      },
    })(e);
  };
}

export function createPanelRowHeightResizeHandler<T extends Record<string, unknown>>(
  key: "mainPanelRow0Height" | "mainPanelRow1Height",
  storeId: Id | (() => Id | undefined),
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  rowRef: () => HTMLDivElement | undefined,
  setIsResizing: (value: boolean) => void,
  setActiveResizeKey: (value: null | string) => void,
  minHeight = 120,
) {
  return (e: PointerEvent) => {
    const row = rowRef();
    if (!row) {
      return;
    }

    createAxisResizeHandler({
      axis: "y",
      getStartSize: () => row.getBoundingClientRect().height,
      growOnDragPositive: true,
      minSize: minHeight,
      onEnd: () => {
        setIsResizing(false);
        setActiveResizeKey(null);
      },
      onResize: (newHeight) => {
        const resolvedStoreId =
          typeof storeId === "function" ? storeId() : storeId;
        if (!resolvedStoreId) {
          return;
        }
        mergeVertexProperties<T>(0, resolvedStoreId, graph, setGraph, {
          [key]: newHeight,
        } as unknown as Partial<T>);
      },
      onStart: () => {
        setIsResizing(true);
        setActiveResizeKey(key);
      },
    })(e);
  };
}

export function createMainPanelRowWidthResizeHandler<
  T extends Record<string, unknown>,
>(
  rowIndex: 0 | 1,
  storeId: Id | (() => Id | undefined),
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  panelRef: () => HTMLDivElement | undefined,
  setIsResizing: (value: boolean) => void,
  setActiveResizeKey: (value: null | string) => void,
  growOnDragRight = true,
) {
  const key = `mainPanelRow${rowIndex}Width`;
  return (e: PointerEvent) => {
    const panel = panelRef();
    if (!panel) {
      return;
    }

    createAxisResizeHandler({
      axis: "x",
      getStartSize: () => panel.getBoundingClientRect().width,
      growOnDragPositive: growOnDragRight,
      minSize: 100,
      onEnd: () => {
        setIsResizing(false);
        setActiveResizeKey(null);
      },
      onResize: (newWidth) => {
        const resolvedStoreId =
          typeof storeId === "function" ? storeId() : storeId;
        if (!resolvedStoreId) {
          return;
        }
        mergeVertexProperties<T>(0, resolvedStoreId, graph, setGraph, {
          [key]: newWidth,
        } as unknown as Partial<T>);
      },
      onStart: () => {
        setIsResizing(true);
        setActiveResizeKey(key);
      },
    })(e);
  };
}
