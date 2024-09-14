import { createSignal, For, Show } from "solid-js";

import { DropdownMenu } from "~/components/DropdownMenu";
import { useToast } from "~/components/Toast";
import { getGlobalThemeVertex } from "~/getGlobalThemeVertex";
import { useGraph } from "~/lib/graph/graph";

import { ThemeConfigDialog } from "./ThemeConfigDialog";

export function ThemeDropdownMenu() {
  const [isOpen, setIsOpen] = createSignal(false);
  const [selectedTheme, setSelectedTheme] = createSignal(null);
  const [showConfigDialog, setShowConfigDialog] = createSignal(false);
  const { showErrorToast } = useToast();
  const [graph] = useGraph();
  const [buttonRef, setButtonRef] = createSignal<HTMLButtonElement>();

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

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
      <Show when={isOpen()}>
        <DropdownMenu
          class="theme-dropdown"
          onClickOutside={handleClose}
          parentRef={buttonRef()!}
        >
          <ul>
            <For each={graph.vertexLabelIdMap.Theme}>
              {(theme) => {
                const isSelected = getGlobalThemeVertex(graph)?.id === theme; // Check if the theme is selected
                return (
                  <li class={`${isSelected ? 'bg:beryl-45' : ''} flex ai:center`}> {/* Add a class for highlighting */}
                    <span onClick={() => handleThemeSelect(theme)}>{graph.vertexes[theme].P.key}</span>
                    <button
                      class="gear-icon"
                      onClick={() => {
                        setShowConfigDialog(true);
                        handleClose();
                      }}
                    >
                      ⚙️
                    </button>
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
      <Show when={showConfigDialog()}>
        <ThemeConfigDialog
          onClose={() => setShowConfigDialog(false)}
          theme={selectedTheme()} />
      </Show>
    </>
  );
}
