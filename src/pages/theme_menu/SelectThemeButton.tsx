import { createSignal, Show } from "solid-js";

import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { IconButton } from "~/components/styled/IconButton";

import { SelectThemeMenu } from "./SelectThemeMenu";
import {headerIconButtonClass} from "~/pages/settings/constants";

export function SelectThemeButton() {
  const [isThemeOptionsOpen, setIsThemeOptionsOpen] = createSignal(false);
  const [buttonRef, setButtonRef] = createSignal<HTMLButtonElement>();

  return (
    <>
      <IconButton
        class={headerIconButtonClass}
        icon="ph:paint-bucket"
        onClick={() => setIsThemeOptionsOpen(true)}
        ref={setButtonRef}
        size={22}
        title="Select Theme"
        tooltipGroup="right-buttons"
        type="button"
      />
      <Show when={isThemeOptionsOpen()}>
        <DropdownMenu
          class="theme-dropdown"
          onClickOutside={() => setIsThemeOptionsOpen(false)}
          parentRef={buttonRef()!}
        >
          <SelectThemeMenu />
        </DropdownMenu>
      </Show>
    </>
  );
}
