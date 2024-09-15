import { createSignal, For, Show } from "solid-js";

import { DropdownMenu } from "~/components/DropdownMenu";
import { IconButton } from "~/components/IconButton";
import { useToast } from "~/components/Toast";
import { getGlobalThemeVertex } from "~/getGlobalThemeVertex";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";

import { ThemeConfigDialog } from "./ThemeConfigDialog";

export function ThemeDropdownMenu() {
  const [isThemeOptionsOpen, setIsThemeOptionsOpen] = createSignal(false);
  const [, setSelectedTheme] = createSignal<Id>();
  const { showErrorToast } = useToast();
  const [graph] = useGraph();
  const [buttonRef, setButtonRef] = createSignal<HTMLButtonElement>();

  const handleOpen = () => setIsThemeOptionsOpen(true);
  const handleClose = () => setIsThemeOptionsOpen(false);

  const handleThemeSelect = (theme: any) => {
    setSelectedTheme(theme);
  };

  const handleAddNewTheme = () => {
    // Logic to add a new theme
    showErrorToast("Add new theme functionality not implemented yet.");
  };

  return (
    <>
      <button
        class="theme-dropdown-button"
        onClick={handleOpen}
        ref={setButtonRef}
      >
        Themes
      </button>
      <Show when={isThemeOptionsOpen()}>
        <DropdownMenu
          class="theme-dropdown"
          onClickOutside={handleClose}
          parentRef={buttonRef()!}
        >
          <ul>
            <For each={graph.vertexLabelIdMap.Theme}>
              {(theme) => {
                const isSelected = getGlobalThemeVertex(graph)?.id === theme;
                return (
                  <li
                    class={`${isSelected ? "bg:beryl-45" : ""} flex ai:center bg:lightblue:hover`}
                  >
                    <span onClick={() => handleThemeSelect(theme)}>
                      {graph.vertexes[theme].P.key}
                    </span>
                    <ThemeConfigButton item={graph.vertexes[theme]} size={16} />
                  </li>
                );
              }}
            </For>
            <li>
              <button onClick={handleAddNewTheme}>Add New Theme</button>
            </li>
          </ul>
        </DropdownMenu>
      </Show>
    </>
  );
}

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
        icon="ph:gear"
        onClick={() => setShowModal(true)}
        ref={(el) => (saveAsTemplateRef = el)}
        size={props.size}
        title="Save as Template"
      />
      <Show when={showModal()}>
        <ThemeConfigDialog
          item={props.item}
          onClose={() => setShowModal(false)}
          onMouseLeave={() => setShowModal(false)}
          parentRef={saveAsTemplateRef!}
        />
      </Show>
    </>
  );
}
