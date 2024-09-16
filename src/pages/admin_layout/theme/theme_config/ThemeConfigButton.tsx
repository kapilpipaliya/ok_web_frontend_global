import { createSignal, Show } from "solid-js";
import { IconButton } from "~/components/IconButton";
import type { Vertex } from "~/lib/graph/graph";
import { ThemeConfigDialog } from "./ThemeConfigDialog";


export function ThemeConfigButton(props: {
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
        icon="ph:pencil-simple"
        onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
        ref={(el) => (saveAsTemplateRef = el)}
        size={props.size}
        title="Edit Theme" />
      <Show when={showModal()}>
        <ThemeConfigDialog
          item={props.item}
          onClose={() => setShowModal(false)}
          onMouseLeave={() => setShowModal(false)}
          parentRef={saveAsTemplateRef!} />
      </Show>
    </>
  );
}
