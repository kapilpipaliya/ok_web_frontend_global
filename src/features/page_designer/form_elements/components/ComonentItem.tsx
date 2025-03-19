import type { SetStoreFunction } from "solid-js/store";

import { Icon } from "@iconify-icon/solid";
import { createMemo, createSignal, For, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Id, Vertex } from "~/lib/graph/graph";

import { getDynamicComponent } from "~/components/form/functions/getDynamicComponent";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { IconButton } from "~/components/styled/IconButton";
import { isNegative } from "~/lib/data_structure/number/isNegative";
import { type GraphInterface, useGraph } from "~/lib/graph/GraphContext";
import { iconMap } from "~/lib/ui/iconMap";

import type { PageLayoutObject } from "../../context/LayoutContext";

import {
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { resetDragDropState } from "../../event_handler/resetDragDropState";
import { OpenComponentSettings } from "../../OpenComponentSettings";
import { TreeItemContainer } from "../../settings/layout/TreeItemContainer";
import { TreeItemExpandButton } from "../../settings/layout/TreeItemExpandButton";
import { openInNewInternalTab } from "../pages/openInNewInternalTab";
import { PreviewIsolated } from "../pages/PreviewIsolated";
import { getCompChildren } from "./getCompChildren";
import { onCompDragStart } from "./onCompDragStart";

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
  const [isHovered, _setIsHovered] = createSignal(false);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const [_hoverPageId, setHoverPageId] = createSignal<Id | null>(null);
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const formStoreId = useDesignerFormIdContext();
  const _formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const [selectedComponents, setSelectedComponents] = createSignal(
    new Set<Vertex>(),
  );

  let previewCSSRef: HTMLDivElement | undefined;
  let previewTimer: NodeJS.Timeout;
  let menuRef: HTMLDivElement;

  const handleCheckboxChange = (event: Event, id: Id) => {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      setSelectedComponents((prev) => new Set(prev).add(graph.vertexes[id]));
    } else {
      setSelectedComponents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(graph.vertexes[id]);
        return newSet;
      });
    }
  };

  const handleMouseEnter = () => {
    if (props.previewPageId !== props.child.id) {
      props.setPreviewPageId(null);
    }
    setHoverPageId(props.child.id);
    previewTimer = setTimeout(() => {
      props.setPreviewPageId(props.child.id);
    }, 500);
  };

  const handleMouseLeave = (event: MouseEvent) => {
    clearTimeout(previewTimer);
    setHoverPageId(null);
    const relatedTarget = event.relatedTarget as Node;
    const floatingElement = floating();
    if (
      floatingElement?.contains(relatedTarget) ||
      previewCSSRef?.contains(relatedTarget)
    ) {
      // Mouse is over either floating() or previewCSSRef, don't close
      return;
    }
    // handle any other logic
    props.setPreviewPageId(null);
  };

  const onDragEnd = () => {
    resetDragDropState(layoutStoreVertex(), graph, setGraph);
  };
  const children = createMemo(() =>
    getCompChildren([props.child], props.edgeName, graph),
  );
  return (
    <>
      <TreeItemContainer
        class={isNegative(props.child.id) ? "bg:#e8ffe8" : ""}
        draggable={"true"}
        hasChildren={!!children().length}
        isHovered={isHovered()}
        onClick={() => props.toggleExpand(props.child.id)}
        onDblClick={() => props.onDoubleClick?.(props.child)}
        onDragEnd={onDragEnd}
        onDragStart={(e) => {
          // props.setPreviewPageId(null);
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
        onMouseLeave={handleMouseLeave}
        ref={menuRef!}
      >
        <div
          classList={{
            "bl:1px|dashed|black pl:10": !children().length,
            "d:flex ai:center": true,
          }}
        >
          <TreeItemExpandButton
            hasChildren={!!children().length}
            isCollapsed={!props.expandedKeys.includes(props.child.id)}
            metaVertexId={props.child.id}
            toggleExpand={props.toggleExpand}
          />
          <Show when={isHovered()}>
            <OpenComponentSettings
              class="cursor:pointer position:absolute right:3px top:3px"
              id={props.child.id}
            />
          </Show>

          <Show
            when={
              isHovered() ||
              selectedComponents().has(graph.vertexes[props.child.id])
            }
          >
            <input
              checked={selectedComponents().has(graph.vertexes[props.child.id])}
              class="left:7px position:absolute top:2px"
              onChange={(e) => handleCheckboxChange(e, props.child.id)}
              type="checkbox"
              // wrapperClass="height:19px width:19px"
            />
          </Show>
          <div class="flex cursor:pointer gap:5px pt:5px">
            <Show when={false}>
              <Icon
                height={24}
                icon={
                  iconMap[props.child?.P.key as keyof typeof iconMap] ??
                  "material-symbols:widgets-outline-rounded"
                }
                noobserver
                width={24}
              />
            </Show>
            <span
              class={`${props.child?.L[0] === "Comp" && !getDynamicComponent(props.child?.P.key) ? "color:error" : ""} font-size:14px`}
            >
              {props.child?.P.label || props.child?.P.key}
            </span>
            <Show when={props.child.L[0] !== "Comp"}>
              <div class="margin-left:auto">
                <IconButton
                  icon="ph:arrow-square-out"
                  onClick={() =>
                    openInNewInternalTab(
                      layoutStoreId,
                      props.child,
                      graph,
                      setGraph,
                    )
                  }
                  size={18}
                />
              </div>
            </Show>
          </div>
        </div>
      </TreeItemContainer>
      <Show
        when={
          props.child.L[0] !== "Comp" && props.previewPageId === props.child.id
        }
      >
        <DropdownMenu
          offset={{ crossAxis: 30 }}
          onClickOutside={() => props.setPreviewPageId(null)}
          onMouseLeave={(e) => {
            if (!menuRef?.contains(e.relatedTarget as Node)) {
              props.setPreviewPageId(null);
            }
          }}
          parentRef={menuRef!}
          ref={setFloating}
        >
          {/* {toTitle(props.child.P.key)} Preview */}
          <PreviewIsolated
            formId={props.child.id}
            graph={props.previewGraph}
            setGraph={props.setPreviewGraph}
          />
        </DropdownMenu>
      </Show>
      <Show when={props.expandedKeys.includes(props.child.id)}>
        <ul class="pl:8 pt:5">
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
        </ul>
      </Show>
    </>
  );
}
