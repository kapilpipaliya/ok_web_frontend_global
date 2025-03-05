import { createSignal, Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import { SchemaRenderer } from "~/pages/SchemaRenderer";

import { getThemeFormSchema } from "./themeFormSchema";

export function ThemeConfigButton(props: {
  class?: string;
  item: Vertex;
  size: number;
}) {
  let buttonRef: HTMLElement;
  const [showModal, setShowModal] = createSignal(false);

  const handleSuccess = () => {
    setShowModal(false);
  };

  return (
    <>
      <IconButton
        class={`${props.class} cursor:pointer`}
        icon="ph:pencil-simple"
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        ref={(el) => (buttonRef = el)}
        size={props.size}
        title="Edit Theme"
        tooltipGroup="theme-actions"
      />
      <Show when={showModal()}>
        <SchemaRenderer
          form={getThemeFormSchema(handleSuccess, () => setShowModal(false))}
          formDataId={props.item.id}
        />
      </Show>
    </>
  );
}
