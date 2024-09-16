import { createSignal, Show } from "solid-js";

import { DropdownMenu } from "~/components/DropdownMenu";
import { IconButton } from "~/components/IconButton";

import { headerIconButtonClass } from "../constant";
import { SelectThemeMenu } from "./SelectThemeMenu";

export function SelectThemeButton() {
  const [isThemeOptionsOpen, setIsThemeOptionsOpen] = createSignal(false);
  const [buttonRef, setButtonRef] = createSignal<HTMLButtonElement>();

  return (
    <>
      <IconButton
        class={headerIconButtonClass}
        icon="mdi:paint-outline"
        onClick={() => setIsThemeOptionsOpen(true)}
        ref={setButtonRef}
        size={22}
        title="Close"
        type="button"
      />
      <Show when={isThemeOptionsOpen()}>
        <DropdownMenu
          class="theme-dropdown"
          onClickOutside={() => setIsThemeOptionsOpen(false)}
          parentRef={buttonRef()!}
        >
          <SelectThemeMenu/>
        </DropdownMenu>
      </Show>
    </>
  );
}
