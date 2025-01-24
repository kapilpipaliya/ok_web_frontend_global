import { createSignal, Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";

import { ImportMenu } from "./ImportMenu";

export function ImportHtmlButton(
  props: Readonly<{
    class?: string;
    item: Vertex;
    size: number;
  }>,
) {
  let saveAsTemplateRef: HTMLElement;
  const [showModal, setShowModal] = createSignal(false);
  return (
    <>
      <IconButton
        class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
        icon="ph:arrow-square-down"
        iconClass="transition:0.5s|ease-in-out"
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        ref={(el) => (saveAsTemplateRef = el)}
        size={props.size}
        title="Save as Template"
      />
      <Show when={showModal()}>
        <ImportMenu
          item={props.item}
          onClose={() => setShowModal(false)}
          // onMouseLeave={() => setShowModal(false)}
          parentRef={saveAsTemplateRef!}
        />
      </Show>
    </>
  );
}
