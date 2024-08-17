import { Icon } from "@iconify-icon/solid";
import { createSignal, JSX, Show } from "solid-js";

import { Checkbox } from "~/components/solid_blocks/checkbox/checkbox";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { iconMap } from "~/lib/ui/iconMap";

import { resetDragDropState } from "../../event_handler/resetDragDropState";
import { useDesignerLayoutStore } from "../../LayoutContext";
import { OpenComponentSettings } from "../../OpenComponentSettings";
import { ComponentPreview } from "./ComponentPreview";

function ComponentItemContainer(props: {
  child: Vertex;
  children: JSX.Element;
  isHovered: boolean;
  onMouseEnter: (el: MouseEvent) => void;
  onMouseLeave: (el: MouseEvent) => void;
  ref: (el: HTMLDivElement) => void;
  selectedComponents?: () => Set<Vertex>;
  setSelectedComponents?: (updater: (prev: Set<Vertex>) => Set<Vertex>) => void;
}) {
  const [graph] = useGraph();
  const [, setLayoutStore] = useDesignerLayoutStore() || [];

  const onDragEnd = () => {
    resetDragDropState(setLayoutStore);
  };

  const onDragStart = (e: DragEvent) => {
    e.stopPropagation();
    setLayoutStore("draggedVertices", []);
    const dataTransfer = props.selectedComponents && props.selectedComponents().size > 0
      ? Array.from(props.selectedComponents())
      : [graph.vertexes[props.child.id]];
    setLayoutStore("draggedVertices", (prev) => [...prev, ...dataTransfer]);
    if (props.setSelectedComponents) {
      props.setSelectedComponents(() => new Set<Vertex>());
    }
  };

  const baseStyle = "background-color:white border-radius:.2rem box-shadow:rgba(0,0,0,0.2)|0px|0px|5px|0px position:relative transition:transform|0.2s|ease-in-out,|box-shadow|0.2s|ease-in-out";

  const hoverStyle = "box-shadow:4px|4px|4px cursor:move";

  const itemStyle = () => props.isHovered ? `${baseStyle} ${hoverStyle}` : baseStyle;

  return (
    <div // NOSONAR

      class={itemStyle()}
      draggable={true}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      ref={props.ref}
    >
      {props.children}
    </div>
  );
}

export function ComonentItem(props: Readonly<{ child: Vertex }>) {
  const [graph] = useGraph();
  const [isHovered, setIsHovered] = createSignal(false);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);

  const [selectedComponents, setSelectedComponents] = createSignal(
    new Set<Vertex>(),
  );
  const [showPreview, setShowPreview] = createSignal(false);
  let previewCSSRef: HTMLDivElement | undefined;
  let previewTimer: NodeJS.Timeout;

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

  const handlePreviewMouseEnter = () => {
    previewTimer = setTimeout(() => setShowPreview(true), 400);
  };

  const handlePreviewMouseLeave = (event: MouseEvent) => {
    clearTimeout(previewTimer);
    const relatedTarget = event.relatedTarget as Node;
    const floatingElement = floating();
    if (
      (floatingElement && floatingElement.contains(relatedTarget)) ||
      (previewCSSRef && previewCSSRef.contains(relatedTarget))
    ) {
      // Mouse is over either floating() or previewCSSRef, don't close
      return;
    }
    setShowPreview(false);
  };

  return (
    <ComponentItemContainer
      child={props.child}
      isHovered={isHovered()}
      onMouseEnter={() => {
        // setIsHovered(true);
        handlePreviewMouseEnter();
      }}
      onMouseLeave={(el) => {
        // setIsHovered(false);
        handlePreviewMouseLeave(el);
      }}
      ref={(el) => (previewCSSRef = el)}
      selectedComponents={selectedComponents}
      setSelectedComponents={setSelectedComponents}
    >
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
      <div class="flex {flex-flow:column} ai:center gap:5px pt:5px">
        <Show when={false}>
          <Icon
            height={24}
            icon={
              iconMap[props.child?.P.name as keyof typeof iconMap] ??
              "material-symbols:widgets-outline-rounded"
            }
            width={24}
          />
        </Show>
        <span class="font-size:14px">
          {props.child?.P.label || props.child?.P.name}
        </span>
      </div>
      <Show when={showPreview()}>
        <ComponentPreview
          item={props.child}
          onClose={() => setShowPreview(false)}
          onMouseLeave={(event) => {
            if (previewCSSRef && !previewCSSRef.contains(event.relatedTarget as Node)) {
              setShowPreview(false);
            }
          }}
          parentRef={previewCSSRef!}
          ref={setFloating}
        />
      </Show>
    </ComponentItemContainer>
  );
}
