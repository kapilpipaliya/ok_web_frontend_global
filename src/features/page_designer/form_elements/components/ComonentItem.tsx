import type { SetStoreFunction } from "solid-js/store";

import { Icon } from "@iconify-icon/solid";
import { createMemo, createSignal, For, Show } from "solid-js";
import { toTitle } from "case-switcher-js";

import type { Id, Vertex } from "~/lib/graph/graph";

import { getDynamicComponent } from "~/components/form/functions/getDynamicComponent";
import { IconButton } from "~/components/styled/IconButton";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { isNegative } from "~/lib/data_structure/number/isNegative";
import { type GraphInterface, useGraph } from "~/lib/graph/GraphContext";
import { iconMap } from "~/lib/ui/iconMap";

import type { PageLayoutObject } from "../../context/LayoutContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { resetDragDropState } from "../../event_handler/resetDragDropState";
// import { OpenComponentSettings } from "../../OpenComponentSettings";
import { TreeItemExpandButton } from "../../settings/layout/TreeItemExpandButton";
import { PreviewIsolated } from "../pages/PreviewIsolated";
import { getCompChildren } from "./functions/getCompChildren";
import { onCompDragStart } from "./functions/onCompDragStart";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import {
  baseItemStyle,
  hoverItemStyle,
  buttonStyle,
  setupPreview,
  createOpenInNewTab,
} from "../common/ItemStyles";

export function ComponentItem(
  props: Readonly<{
    child: Vertex;
    edgeName: string;
    expandedKeys: string[];
    onDoubleClick?: (fromVertex: Vertex) => void;
    previewGraph: GraphInterface;
    previewPageId: Id | null;
    setPreviewGraph: SetStoreFunction<GraphInterface>;
    setPreviewPageId: (id: Id | null) => void;
    toggleExpand: (itemId: Id) => void;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const [isHovered, setIsHovered] = createSignal(false);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const [hoverPageId, setHoverPageId] = createSignal<Id | null>(null);
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;

  const [selectedComponents, setSelectedComponents] = createSignal(
    new Set<Vertex>(),
  );

  let previewCSSRef: HTMLDivElement | undefined;
  let menuRef: HTMLDivElement | undefined;

  // Use shared preview setup with function for props
  const { handleMouseEnter, handleMouseLeave } = setupPreview(
    () => ({
      previewPageId: props.previewPageId,
      setPreviewPageId: props.setPreviewPageId,
      itemId: props.child.id,
    }),
    {
      setHoverPageId,
      setIsHovered,
    },
  );

  const getItemStyle = () => {
    const backgroundColor = isNegative(props.child.id) ? "#e8ffe8" : "white";
    const baseStyle = `${baseItemStyle}; background-color: ${backgroundColor};`;
    return hoverPageId() === props.child.id
      ? `${baseStyle} ${hoverItemStyle}`
      : baseStyle;
  };

  // const handleCheckboxChange = (event: Event, id: Id) => {
  //   const isChecked = (event.target as HTMLInputElement).checked;
  //   if (isChecked) {
  //     setSelectedComponents((prev) => new Set(prev).add(graph.vertexes[id]));
  //   } else {
  //     setSelectedComponents((prev) => {
  //       const newSet = new Set(prev);
  //       newSet.delete(graph.vertexes[id]);
  //       return newSet;
  //     });
  //   }
  // };

  const onDragEnd = () => {
    resetDragDropState(layoutStoreVertex(), graph, setGraph);
  };

  const children = createMemo(() =>
    getCompChildren([props.child], props.edgeName, graph),
  );

  // Use shared function to create open in new tab handler
  const openInNewTab = createOpenInNewTab(
    layoutStoreId,
    props.child,
    graph,
    setGraph,
  );

  // Check if component should show an icon (not from Component or Templates)
  const shouldShowIcon = () => {
    return (
      props.child.L[0] !== "Component" && props.child.L[0] !== "TemplatePage"
    );
  };

  // Get display name for the component
  const getDisplayName = () => {
    const rawName = props.child?.P.label || props.child?.P.key;
    return rawName ? toTitle(rawName) : "";
  };

  return (
    <>
      <As
        as="div"
        css={getItemStyle()}
        draggable={"true"}
        onClick={() => props.toggleExpand(props.child.id)}
        onDblClick={() => props.onDoubleClick?.(props.child)}
        onDragEnd={onDragEnd}
        onDragStart={(e) => {
          return onCompDragStart(
            e,
            graph,
            setGraph,
            props.child.id,
            layoutStoreVertex(),
            selectedComponents,
            setSelectedComponents,
          );
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={(e) => handleMouseLeave(e, floating(), previewCSSRef)}
        ref={(el) => (menuRef = el)}
      >
        <Show when={children().length > 0}>
          <TreeItemExpandButton
            hasChildren={!!children().length}
            isCollapsed={!props.expandedKeys.includes(props.child.id)}
            metaVertexId={props.child.id}
            toggleExpand={props.toggleExpand}
          />
        </Show>

        <Show when={shouldShowIcon()}>
          <Icon
            height={22}
            icon={
              props.child.P.icon ??
              iconMap[props.child?.P.key as keyof typeof iconMap] ??
              "ph:cube-duotone"
            }
            noobserver
            width={22}
          />
        </Show>

        <As
          as="div"
          css={css`
            font-size: 14px;
            font-weight: normal;
            ${props.child?.L[0] === "Comp" && !getDynamicComponent(props.child?.P.key) ? `color: \${args.theme.var.color.error};` : ""}
          `}
        >
          {getDisplayName()}
        </As>

        {/* <Show when={isHovered()}>
          <OpenComponentSettings
            css={css`
              cursor: pointer;
              position: absolute;
              right: 30px;
              top: 8px;
            `}
            id={props.child.id}
          />
        </Show> */}

        {/* <Show when={isHovered() || selectedComponents().has(graph.vertexes[props.child.id])}>
          <As
            as="input"
            checked={selectedComponents().has(graph.vertexes[props.child.id])}
            css={css`
              position: absolute;
              right: 55px;
              top: 10px;
            `}
            onChange={(e) => handleCheckboxChange(e, props.child.id)}
            type="checkbox"
          />
        </Show> */}

        <Show when={props.child.L[0] !== "Comp" && isHovered()}>
          <As as="div" css={css`margin-left: auto;`}>
            <IconButton
              css={buttonStyle}
              icon="ph:arrow-square-out"
              onClick={openInNewTab}
              size={18}
              title="Open in new tab"
            />
          </As>
        </Show>
      </As>

      {/* Handle dropdown preview */}
      <Show
        when={
          props.child.L[0] !== "Comp" &&
          props.previewPageId === props.child.id &&
          menuRef
        }
      >
        <DropdownMenu
          offset={{ crossAxis: 30 }}
          onClickOutside={() => props.setPreviewPageId(null)}
          onMouseLeave={(e) => {
            if (menuRef && !menuRef.contains(e.relatedTarget as Node)) {
              props.setPreviewPageId(null);
            }
          }}
          parentRef={menuRef as HTMLElement}
          ref={(el) => el && setFloating(el)}
        >
          {/* {toTitle(props.child.P.key)} Preview */}
          <PreviewIsolated
            formId={props.child.id}
            graph={props.previewGraph}
            setGraph={props.setPreviewGraph}
          />
        </DropdownMenu>
      </Show>

      {/* Render children */}
      <Show
        when={
          children().length > 0 && props.expandedKeys.includes(props.child.id)
        }
      >
        <As
          as="ul"
          css={css`
            padding-left: 20px;
            padding-top: 5px;
            list-style: none;
          `}
        >
          <For each={children()}>
            {(child) => (
              <ComponentItem
                child={child}
                edgeName={props.edgeName}
                expandedKeys={props.expandedKeys}
                onDoubleClick={props.onDoubleClick}
                previewGraph={props.previewGraph}
                previewPageId={props.previewPageId}
                setPreviewGraph={props.setPreviewGraph}
                setPreviewPageId={props.setPreviewPageId}
                toggleExpand={props.toggleExpand}
              />
            )}
          </For>
        </As>
      </Show>
    </>
  );
}
