import { Icon } from "@iconify-icon/solid";
import { createSignal, Show } from "solid-js";

import { getDynamicComponent } from "~/components/form/functions/getDynamicComponent";
import { Checkbox } from "~/components/solid_blocks/checkbox/checkbox";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";
import { iconMap } from "~/lib/ui/iconMap";

import { OpenComponentSettings } from "../../OpenComponentSettings";
import { ComponentItemContainer } from "./ComponentItemContainer";
import { ComponentPreview } from "./preview/ComponentPreview";

export function ComonentItem(
  props: Readonly<{
    child: Vertex;
    expandedComponent?: Vertex;
    onDoubleClick?: (fromVertex: Vertex) => void;
    setExpandedComponent: (component?: Vertex) => void;
  }>,
) {
  const [graph] = useGraph();
  const [isHovered, _setIsHovered] = createSignal(false);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);

  const [selectedComponents, setSelectedComponents] = createSignal(
    new Set<Vertex>(),
  );
  const [_showPreview, setShowPreview] = createSignal(false);
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

  const _handlePreviewMouseEnter = () => {
    previewTimer = setTimeout(() => setShowPreview(true), 400);
  };

  const _handlePreviewMouseLeave = (event: MouseEvent) => {
    clearTimeout(previewTimer);
    const relatedTarget = event.relatedTarget as Node;
    const floatingElement = floating();
    if (
      floatingElement?.contains(relatedTarget) ||
      previewCSSRef?.contains(relatedTarget)
    ) {
      // Mouse is over either floating() or previewCSSRef, don't close
      return;
    }
    setShowPreview(false);
  };

  return (
    <>
      <ComponentItemContainer
        child={props.child}
        isHovered={isHovered()}
        onClick={() => {
          props.setExpandedComponent(
            props.child === props.expandedComponent ? undefined : props.child,
          );
        }}
        onDoubleClick={props.onDoubleClick}
        // onMouseEnter={() => {
        //   // setIsHovered(true);
        //   handlePreviewMouseEnter();
        // }}
        // onMouseLeave={(el) => {
        //   // setIsHovered(false);
        //   handlePreviewMouseLeave(el);
        // }}
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
        <div class="flex {flex-flow:column} cursor:pointer gap:5px pt:5px">
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
        </div>
      </ComponentItemContainer>
      <Show when={props.expandedComponent === props.child}>
        <ComponentPreview
          item={props.child}
          // onClose={() => setShowPreview(false)}
          // onMouseLeave={(event) => {
          //   if (
          //     previewCSSRef &&
          //     !previewCSSRef.contains(event.relatedTarget as Node)
          //   ) {
          //     setShowPreview(false);
          //   }
          // }}
          parentRef={previewCSSRef!}
          ref={setFloating}
        />
      </Show>
    </>
  );
}
