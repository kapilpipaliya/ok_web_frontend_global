import { createSignal, Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";

import { SaveAsTemplateMenu } from "./SaveAsTemplateMenu";
import { DropdownMenu } from "~/components/styled/DropdownMenu";

export function SaveAsTemplateButton(props: {
  class?: string;
  item: Vertex;
  size: number;
}) {
  let saveAsTemplateRef: HTMLElement;
  const [showModal, setShowModal] = createSignal(false);
  const [showTemplateMenu, setShowTemplateMenu] = createSignal(false);
  const [saveAsLabel, setSaveAsLabel] = createSignal<"Template" | "Component">("Template");

  const handleMenuSelect = (label: "Template" | "Component") => {
    setSaveAsLabel(label);
    setShowModal(false);
    setShowTemplateMenu(true);
  };

  return (
    <>
      <IconButton
        class={`${props.class} cursor:pointer`}
        icon="fluent:save-as-24-regular"
        onClick={() => setShowModal(true)}
        ref={(el) => (saveAsTemplateRef = el)}
        size={props.size}
        title="Save as Template"
      />
      <Show when={showModal()}>
        <DropdownMenu
          class="padding:0.50rem"
          onClickOutside={() => setShowModal(false)}
          // onMouseLeave={() => setShowModal(false)}
          parentRef={saveAsTemplateRef!}
        >
          <div class="flex flex-col gap:0.5rem">
            <button
              class="text-align:left px:1rem py:0.5rem hover:bg:gray-10"
              onClick={() => handleMenuSelect("Template")}
            >
              Save as Template
            </button>
            <button
              class="text-align:left px:1rem py:0.5rem hover:bg:gray-10"
              onClick={() => handleMenuSelect("Component")}
            >
              Save as Component
            </button>
          </div>
        </DropdownMenu>
      </Show>

      <Show when={showTemplateMenu()}>
        <SaveAsTemplateMenu
          item={props.item}
          onClose={() => setShowTemplateMenu(false)}
          // onMouseLeave={() => setShowTemplateMenu(false)}
          onClickOutside={() => setShowTemplateMenu(false)}
          parentRef={saveAsTemplateRef!}
          saveAsLabel={saveAsLabel()}
        />
      </Show>
    </>
  );
}
