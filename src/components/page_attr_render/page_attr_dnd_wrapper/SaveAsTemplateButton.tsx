import { createSignal, Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/IconButton";

import { SaveAsTemplateMenu } from "./SaveAsTemplateMenu";

export function SaveAsTemplateButton(props: { class?: string; item: Vertex; size: number; }) {
  let saveAsTemplateRef: HTMLElement;
  const [showModal, setShowModal] = createSignal(false);
  return <>
    <IconButton
      class={`${props.class} cursor:pointer`}
      icon="fluent:save-as-24-regular"
      onClick={() => setShowModal(true)}
      ref={(el) => (saveAsTemplateRef = el)}
      size={props.size}
      title="Save as Template" />
    <Show when={showModal()}>
      <SaveAsTemplateMenu
        item={props.item}
        onClose={() => setShowModal(false)}
        onMouseLeave={() => setShowModal(false)}
        parentRef={saveAsTemplateRef!} />
    </Show>
  </>;
}
