import { createSignal, Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";

import { PreviewCSSMenu } from "./PreviewCSSMenu";

export function PreviewCSSButton(
  props: Readonly<{
    class?: string;
    item: Vertex;
    size: number;
  }>,
) {
  let previewCSSRef: HTMLElement;
  const [showModal, setShowModal] = createSignal(false);
  const [floating, setFloating] = createSignal<HTMLElement | null>(null);
  let timer: NodeJS.Timeout;

  const handleMouseEnter = () => {
    timer = setTimeout(() => setShowModal(true), 500);
  };

  const handleMouseLeave = (event: MouseEvent) => {
    clearTimeout(timer);
    const relatedTarget = event.relatedTarget as Node;
    const floatingElement = floating();

    // https://javascript.info/mousemove-mouseover-mouseout-mouseenter-mouseleave
    if (
      !(
        previewCSSRef?.contains(relatedTarget) ||
        floatingElement?.contains(relatedTarget)
      )
    ) {
      setShowModal(false);
    }
  };

  return (
    <>
      <IconButton
        class={`${props.class} cursor:pointer`}
        icon="ic:baseline-css"
        onClick={() => setShowModal(true)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={(el) => (previewCSSRef = el)}
        size={props.size}
        title="Preview CSS"
      />
      <Show when={showModal()}>
        <PreviewCSSMenu
          item={props.item}
          onClose={() => setShowModal(false)}
          onMouseLeave={(event) => {
            if (
              previewCSSRef &&
              !previewCSSRef.contains(event.relatedTarget as Node)
            ) {
              setShowModal(false);
            }
          }}
          parentRef={previewCSSRef!}
          ref={setFloating}
        />
      </Show>
    </>
  );
}
