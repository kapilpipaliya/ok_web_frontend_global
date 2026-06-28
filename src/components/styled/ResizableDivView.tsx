import {
  createEffect,
  createSignal,
  type JSX,
  on,
  onCleanup,
} from "solid-js";

import {
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { createAxisResizeHandler } from "~/lib/resizable/createAxisResizeHandler";
import { DesignerResizeHandle } from "~/lib/resizable/DesignerResizeHandle";
import { useResizeOverlay } from "~/lib/resizable/ResizeOverlayContext";
import { useDesignerResizeTrackSize } from "~/lib/resizable/useDesignerResizeTrackSize";
import { attachRootDropTarget } from "~/features/page_designer/functions/drag_drop/pragmatic/pragmaticDragDrop";
import {
  bindDragDropRef,
  cleanupDragDropRef,
} from "~/features/page_designer/functions/drag_drop/pragmatic/bindDragDropRef";
import { STYLES } from "~/pages/settings/constants";

import type { FormStoreObject } from "../form/context/FormContext";

import { useToast } from "./modal/Toast";
import { As } from "../As";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import type { CssType } from "../form/type/CssType";

export const DIMENSIONS = {
  desktop: {
    height: "1200px",
    icon: "ph:desktop",
    id: "desktop",
    width: "1000px",
  },
  mobile: {
    height: "570px",
    icon: "ph:device-mobile",
    id: "mobile",
    width: "360px",
  },
  tablet: {
    height: "1026px",
    icon: "ph:device-tablet",
    id: "tablet",
    width: "768px",
  },
} as const;

type PreviewResizeKey = "height" | "width-left" | "width-right";

function resolveViewDimensions(view: Vertex | undefined) {
  if (view?.P.width && view?.P.height) {
    return { width: view.P.width as string, height: view.P.height as string };
  }
  const dimension =
    DIMENSIONS[view?.P.view?.toLowerCase() as keyof typeof DIMENSIONS] ||
    DIMENSIONS.desktop;
  return { width: dimension.width, height: dimension.height };
}

function parsePx(value: string) {
  return Number.parseFloat(value) || 0;
}

export function ResizableContainer(
  props: Readonly<{
    children: JSX.Element;
    css?: CssType;
    view: Id;
    width?: string;
    height?: string;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const initialDimensions = resolveViewDimensions(
    graph.vertexes[props.view] as Vertex | undefined,
  );
  const [width, setWidth] = createSignal(
    props.width || initialDimensions.width,
  );
  const [height, setHeight] = createSignal(
    props.height || initialDimensions.height,
  );
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  const [activeResizeKey, setActiveResizeKey] = createSignal<
    null | PreviewResizeKey
  >(null);
  const [isDraggingOver, setIsDraggingOver] = createSignal(false);
  const { showErrorToast } = useToast();
  const { setResizing } = useResizeOverlay();
  const resizeTrackSize = useDesignerResizeTrackSize();
  const trackPx = () => `${resizeTrackSize()}px`;

  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const viewVertex = () =>
    graph.vertexes[props.view] as Vertex<{
      height: string;
      view: string;
      width: string;
    }>;

  createEffect(
    on(
      () =>
        [
          props.view,
          viewVertex()?.P.width,
          viewVertex()?.P.height,
        ] as const,
      () => {
        if (activeResizeKey()) {
          return;
        }
        const dimensions = resolveViewDimensions(viewVertex());
        setWidth(dimensions.width);
        setHeight(dimensions.height);
      },
    ),
  );

  const persistWidth = (newWidth: string) => {
    setWidth(newWidth);
    mergeVertexProperties(0, props.view, graph, setGraph, {
      width: newWidth,
    });
  };

  const persistHeight = (newHeight: string) => {
    setHeight(newHeight);
    mergeVertexProperties(0, props.view, graph, setGraph, {
      height: newHeight,
    });
  };

  /**
   * Left handle uses left-edge-anchored resize: the left edge stays fixed in flex
   * layout and width changes grow/shrink toward the right. Do not use margin-left
   * or translateX — those break multi-panel preview layout.
   */
  const handleLeftWidthResize = createAxisResizeHandler({
    axis: "x",
    getStartSize: () => parsePx(width()),
    growOnDragPositive: false,
    minSize: 50,
    onEnd: () => {
      setActiveResizeKey(null);
      setResizing(false);
    },
    onResize: (size) => persistWidth(`${size}px`),
    onStart: () => {
      setActiveResizeKey("width-left");
      setResizing(true);
    },
  });

  const handleRightWidthResize = createAxisResizeHandler({
    axis: "x",
    getStartSize: () => parsePx(width()),
    growOnDragPositive: true,
    minSize: 50,
    onEnd: () => {
      setActiveResizeKey(null);
      setResizing(false);
    },
    onResize: (size) => persistWidth(`${size}px`),
    onStart: () => {
      setActiveResizeKey("width-right");
      setResizing(true);
    },
  });

  const handleHeightResize = createAxisResizeHandler({
    axis: "y",
    getStartSize: () => parsePx(height()),
    growOnDragPositive: true,
    minSize: 50,
    onEnd: () => {
      setActiveResizeKey(null);
      setResizing(false);
    },
    onResize: (size) => persistHeight(`${size}px`),
    onStart: () => {
      setActiveResizeKey("height");
      setResizing(true);
    },
  });

  const bindRootDrop = bindDragDropRef(
    `resizable-view-${props.view}`,
    (element) =>
      attachRootDropTarget(element, {
        layoutStoreVertex,
        formStoreVertex,
        graph,
        setGraph,
        showErrorToast,
        onDragEnter: () => setIsDraggingOver(true),
        onDragLeave: () => setIsDraggingOver(false),
      }),
  );

  onCleanup(() => {
    cleanupDragDropRef(containerRef());
  });

  const gridCss = () =>
    `return \`._id {
      display: grid;
      grid-template-columns: ${trackPx()} minmax(0, 1fr) ${trackPx()};
      grid-template-rows: minmax(0, 1fr) ${trackPx()};
      border-left: 1px solid \${args.theme.var.color.border};
      border-top: 1px solid \${args.theme.var.color.border};
      min-width: 0;
      min-height: 0;
    }\`;`;

  return (
    <As
      as="div"
      css={[
        ...ensureArray(props.css),
        `return \`._id {
          flex-shrink: 0;
        }\`;`,
      ]}
    >
      <As
        as="div"
        css={[
          gridCss(),
          isDraggingOver()
            ? "return `._id { background-color: ${args.theme.var.color.primary_light_150}; }`;"
            : "",
          activeResizeKey() ? "return `._id { user-select: none; }`;" : "",
        ]}
        ref={(element) => {
          setContainerRef(element);
          bindRootDrop(element);
        }}
        style={{
          height: `calc(${height()} + ${trackPx()})`,
          width: `calc(${width()} + ${2 * resizeTrackSize()}px)`,
        }}
      >
        <DesignerResizeHandle
          active={activeResizeKey() === "width-left"}
          ariaLabel="Resize preview width from left"
          axis="x"
          onPointerDown={handleLeftWidthResize}
        />
        <As
          as="div"
          css={[
            STYLES.overflowCss,
            `return \`._id {
              min-width: 0;
              min-height: 0;
              overflow: hidden;
            }\`;`,
          ]}
        >
          {props.children}
        </As>
        <DesignerResizeHandle
          active={activeResizeKey() === "width-right"}
          ariaLabel="Resize preview width from right"
          axis="x"
          onPointerDown={handleRightWidthResize}
        />
        <div aria-hidden="true" />
        <DesignerResizeHandle
          active={activeResizeKey() === "height"}
          ariaLabel="Resize preview height"
          axis="y"
          onPointerDown={handleHeightResize}
        />
        <div aria-hidden="true" />
      </As>
    </As>
  );
}
