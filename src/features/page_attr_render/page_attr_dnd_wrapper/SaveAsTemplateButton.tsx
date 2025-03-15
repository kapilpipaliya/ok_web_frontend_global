import { createSignal, Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { IconButton } from "~/components/styled/IconButton";
import { ICON_BUTTON_STYLES } from "~/pages/settings/constants";

import { SaveAsTemplateMenu } from "./SaveAsTemplateMenu";

interface SaveAsTemplateButtonProps {
  item: Vertex;
  size: number;
}

export function SaveAsTemplateButton(
  props: Readonly<SaveAsTemplateButtonProps>,
) {
  let saveAsTemplateRef: HTMLElement;
  const [showModal, setShowModal] = createSignal(false);
  const [showTemplateMenu, setShowTemplateMenu] = createSignal(false);
  const [saveAsLabel, setSaveAsLabel] = createSignal<"Component" | "Template">(
    "Template",
  );

  const handleMenuSelect = (label: "Component" | "Template") => {
    setSaveAsLabel(label);
    setShowModal(false);
    setShowTemplateMenu(true);
  };

  return (
    <>
      <IconButton
        class={`${ICON_BUTTON_STYLES.base} ${ICON_BUTTON_STYLES.default}`}
        icon="ph:floppy-disk"
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
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
          // onMouseLeave={() => setShowTemplateMenu(false)}
          onClickOutside={() => setShowTemplateMenu(false)}
          onClose={() => setShowTemplateMenu(false)}
          parentRef={saveAsTemplateRef!}
          saveAsLabel={saveAsLabel()}
        />
      </Show>
    </>
  );
}
