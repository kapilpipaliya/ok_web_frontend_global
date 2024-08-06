import { createSignal, Show } from "solid-js";

import { IconButton } from "~/components/IconButton";
import { ZIndex } from "~/components/ZIndex";

import { PermissionModal } from "./PermissionModal";


export function ConfigurePermissionButton(props: { title: string; }) {
  const [showDropdown, setShowDropdown] = createSignal(false);

  const handleAddNewClick = () => {
    setShowDropdown(true);
  };

  return <>
    <IconButton
      class={"opacity:.5 opacity:1:hover"}
      icon={"mingcute:settings-5-line"}
      onClick={handleAddNewClick}
      size={22}
      title={props.title}
    />

    <Show when={showDropdown()}>
      <ZIndex>
        <PermissionModal closeModal={() => setShowDropdown(false)} onSubmit={() => setShowDropdown(false)} />
      </ZIndex>
    </Show>
  </>;
}
