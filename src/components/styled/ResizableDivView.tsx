import {
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  Show,
} from "solid-js";

import {
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import { attachPointerDrag } from "~/features/page_designer/layout/resizable/attachPointerDrag";
import { DesignerResizeHandle } from "~/features/page_designer/layout/resizable/DesignerResizeHandle";
import { useDesignerResizeTrackSize } from "~/features/page_designer/layout/resizable/useDesignerResizeTrackSize";
import { attachRootDropTarget } from "~/features/page_designer/functions/drag_drop/pragmatic/pragmaticDragDrop";
import {
  bindDragDropRef,
  cleanupDragDropRef,
} from "~/features/page_designer/functions/drag_drop/pragmatic/bindDragDropRef";
import { STYLES } from "~/pages/settings/constants";

import type { FormStoreObject } from "../form/context/FormContext";

import { useToast } from "./modal/Toast";
import { ResizeOverlay } from "./ResizeOverlay";
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

export function ResizableContainer(
  props: Readonly<{
    children: JSX.Element;
    css?: CssType;
    view: Id;
    width?: string;
    height?: string;
  }>,
) {
  const [width, setWidth] = createSignal(props.width || "");
  const [graph, setGraph] = useGraph();
  const [height, setHeight] = createSignal(props.height || "");
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  const [activeResizeKey, setActiveResizeKey] = createSignal<
    null | "height" | "width"
  >(null);
  const [isDraggingOver, setIsDraggingOver] = createSignal(false);
  const { showErrorToast } = useToast();
  const resizeTrackSize = useDesignerResizeTrackSize();
  const trackSize = () => `${resizeTrackSize()}px`;

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

  createEffect(() => {
    const view = viewVertex();
    if (view?.P.width && view?.P.height) {
      setWidth(view.P.width);
      setHeight(view.P.height);
    } else {
      const dimension =
        DIMENSIONS[view?.P.view?.toLowerCase() as keyof typeof DIMENSIONS] ||
        DIMENSIONS.desktop;
      setWidth(dimension.width);
      setHeight(dimension.height);
    }
  });

  const handleWidthResize = (e: PointerEvent) => {
    const container = containerRef();
    if (!container) {
      return;
    }

    setActiveResizeKey("width");
    const startX = e.pageX;
    const track = resizeTrackSize();
    const initialWidth = container.offsetWidth - track;

    attachPointerDrag(
      e,
      (point) => {
        const newWidthValue = Math.max(50, initialWidth + (point.pageX - startX));
        const roundedWidth = Math.round(newWidthValue * 100) / 100;
        const newWidth = `${roundedWidth}px`;
        setWidth(newWidth);
        mergeVertexProperties(0, props.view, graph, setGraph, {
          width: newWidth,
        });
      },
      () => setActiveResizeKey(null),
    );
  };

  const handleHeightResize = (e: PointerEvent) => {
    const container = containerRef();
    if (!container) {
      return;
    }

    setActiveResizeKey("height");
    const startY = e.pageY;
    const track = resizeTrackSize();
    const initialHeight = container.offsetHeight - track;

    attachPointerDrag(
      e,
      (point) => {
        const newHeightValue = Math.max(
          50,
          initialHeight + (point.pageY - startY),
        );
        const roundedHeight = Math.round(newHeightValue * 100) / 100;
        const newHeight = `${roundedHeight}px`;
        setHeight(newHeight);
        mergeVertexProperties(0, props.view, graph, setGraph, {
          height: newHeight,
        });
      },
      () => setActiveResizeKey(null),
    );
  };

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

  return (
    <As
      as="div"
      css={[
        ...ensureArray(props.css),
        STYLES.overflowCss,
        `return \`._id {
  display: grid;
  flex-shrink: 0;
}\`;`,
      ]}
    >
      <As
        as="div"
        css={[
          STYLES.overflowCss,
          `return \`._id {
  display: grid;
  grid-template-columns: 1fr ${trackSize()};
  grid-template-rows: 1fr ${trackSize()};
  border-left: 1px solid \${args.theme.var.color.border};
  border-top: 1px solid \${args.theme.var.color.border};
  min-width: 0;
  min-height: 0;
}\`;`,
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
          height: `calc(${height()} + ${trackSize()})`,
          width: `calc(${width()} + ${trackSize()})`,
        }}
      >
        <As
          as="div"
          css={`return \`._id {
            min-width: 0;
            min-height: 0;
            overflow: hidden;
          }\`;`}
        >
          {props.children}
        </As>
        <DesignerResizeHandle
          active={activeResizeKey() === "width"}
          ariaLabel="Resize preview width"
          axis="x"
          onPointerDown={handleWidthResize}
        />
        <DesignerResizeHandle
          active={activeResizeKey() === "height"}
          ariaLabel="Resize preview height"
          axis="y"
          onPointerDown={handleHeightResize}
        />
        <div aria-hidden="true" />
      </As>

      <Show when={activeResizeKey()}>
        <ResizeOverlay />
      </Show>
    </As>
  );
}
