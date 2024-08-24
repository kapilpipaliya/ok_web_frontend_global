import { createSignal, Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/IconButton";

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
        class={`${props.class} cursor:pointer`}
        icon="ri:upload-line"
        onClick={() => setShowModal(true)}
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
