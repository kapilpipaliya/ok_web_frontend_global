import { createSignal, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";
import { IconButton } from "~/components/styled/IconButton";

import { PermissionModal } from "./PermissionModal";

export function ConfigurePermissionButton(props: { title: string }) {
  const [showDropdown, setShowDropdown] = createSignal(false);

  const handleAddNewClick = () => {
    setShowDropdown(true);
  };

  return (
    <>
      <IconButton
        class={"opacity:.5 opacity:1:hover"}
        icon={"ph:gear"}
        onClick={handleAddNewClick}
        size={22}
        title={props.title}
      />

      <Show when={showDropdown()}>
        <ZIndex>
          <PermissionModal
            closeModal={() => setShowDropdown(false)}
            onSubmit={() => setShowDropdown(false)}
          />
        </ZIndex>
      </Show>
    </>
  );
}
