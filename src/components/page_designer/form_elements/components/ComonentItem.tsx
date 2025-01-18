import { Icon } from "@iconify-icon/solid";
import { children, createMemo, createSignal, For, Show } from "solid-js";

import { getDynamicComponent } from "~/components/form/functions/getDynamicComponent";
import { Checkbox } from "~/components/solid_blocks/checkbox/checkbox";
import { GraphInterface, type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { iconMap } from "~/lib/ui/iconMap";

import { OpenComponentSettings } from "../../OpenComponentSettings";

import { onCompDragStart } from "./onCompDragStart";
import { TreeItemContainer } from "../../settings/layout/TreeItemContainer";
import { resetDragDropState } from "../../event_handler/resetDragDropState";
import { FormStoreObject } from "~/components/form/context/FormContext";
import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { PageLayoutObject } from "../../context/LayoutContext";
import { getCompChildren } from "./getCompChildren";
import { TreeItemExpandButton } from "../../settings/layout/TreeItemExpandButton";
import { SetStoreFunction } from "solid-js/store";
import { IconButton } from "~/components/styled/IconButton";
import { openInNewInternalTab } from "../pages/openInNewInternalTab";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { toTitle } from "case-switcher-js";
import { PreviewIsolated } from "../pages/PreviewIsolated";

export function ComponentItem(
  props: Readonly<{
    child: Vertex;
    expandedKeys: string[];
    edgeName: string;
    onDoubleClick?: (fromVertex: Vertex) => void;
    toggleExpand: (itemId: Id) => void;
    previewPageId: Id | null;
    setPreviewPageId: (id: Id | null) => void;
    previewGraph: GraphInterface;
    setPreviewGraph: SetStoreFunction<GraphInterface>;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const [isHovered, _setIsHovered] = createSignal(false);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const [hoverPageId, setHoverPageId] = createSignal<Id | null>(null);
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStore = () => graph.vertexes[layoutStoreId].P as PageLayoutObject;
  const formStoreVertex = () => graph.vertexes[layoutStore().formId!] as Vertex<FormStoreObject>;

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
  };

  const onDragEnd = () => {
    resetDragDropState(layoutStoreId, graph, setGraph);
  };
  const children = createMemo(() => getCompChildren([props.child], props.edgeName, graph));
  return (
    <>
      <TreeItemContainer
        draggable={true}
        hasChildren={!!children().length}
        isHovered={isHovered()}
        onDragEnd={onDragEnd}
        onDragStart={(e) => {
          // props.setPreviewPageId(null);
          return onCompDragStart(e, graph, setGraph, props.child.id, layoutStoreId, selectedComponents,
            setSelectedComponents);
        }
        }
        onDblClick={() => props.onDoubleClick?.(props.child)}
        onClick={() => props.toggleExpand(props.child.id)}
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
            <Checkbox
              checked={selectedComponents().has(graph.vertexes[props.child.id])}
              class="left:7px position:absolute top:2px"
              onChange={(e) => handleCheckboxChange(e, props.child.id)}
              wrapperClass="height:19px width:19px"
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
                width={24}
              />
            </Show>
            <span
              class={`${props.child?.L[0] === "Comp" && !getDynamicComponent(props.child?.P.key) ? "color:red" : ""} font-size:14px`}
            >
              {props.child?.P.label || props.child?.P.key}
            </span>
            <Show when={props.child.L[0] !== "Comp"}>
              <div class="margin-left:auto">
                <IconButton
                  icon="mdi:open-in-new"
                  onClick={() => openInNewInternalTab(layoutStoreId, props.child, layoutStore, graph, setGraph)}
                  size={18}
                />
              </div>
            </Show>
          </div>
        </div>
      </TreeItemContainer>
      <Show when={props.previewPageId === props.child.id}>
        <DropdownMenu
          onClickOutside={() => props.setPreviewPageId(null)}
          onMouseLeave={() => props.setPreviewPageId(null)}
          parentRef={menuRef!}
        >
          {toTitle(props.child.P.key)} Preview
          <PreviewIsolated formId={props.child.id} graph={props.previewGraph} setGraph={props.setPreviewGraph} />
        </DropdownMenu>
      </Show>
      <Show when={props.expandedKeys.includes(props.child.id)}>
        <ul class="pl:8 pt:5">
          <For each={children()}>
            {(child) =>
              <ComponentItem
                expandedKeys={props.expandedKeys}
                edgeName={props.edgeName}
                child={child}
                toggleExpand={props.toggleExpand}
                onDoubleClick={props.onDoubleClick}
                previewPageId={props.previewPageId}
                setPreviewPageId={props.setPreviewPageId}
                previewGraph={props.previewGraph}
                setPreviewGraph={props.setPreviewGraph}
              />
            }
          </For>
        </ul>
      </Show>

    </>
  );
}
