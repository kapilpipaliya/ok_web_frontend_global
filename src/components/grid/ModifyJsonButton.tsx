import { createSignal, Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";

import { ModifyJsonMenu } from "./ModifyJsonMenu";

export function ModifyJsonButton(props: {
  class?: string;
  item: Vertex;
  size: number;
}) {
  let saveAsTemplateRef: HTMLElement;
  const [showModal, setShowModal] = createSignal(false);

  return (
    <>
      <IconButton
        class={`${props.class} cursor:pointer`}
        icon="bxs:edit"
        onClick={() => setShowModal(true)}
        ref={(el) => (saveAsTemplateRef = el)}
        size={props.size}
        title="Modify JSON" />
      <Show when={showModal()}>
        <ModifyJsonMenu
          item={props.item}
          onClose={() => setShowModal(false)}
          onMouseLeave={() => setShowModal(false)}
          parentRef={saveAsTemplateRef!} />
      </Show>
    </>
  );
}
