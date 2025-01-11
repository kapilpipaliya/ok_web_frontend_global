import { createSignal, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";
import { DropdownMenu } from "~/components/styled/DropdownMenu";

import { AddNewVariant } from "./AddNewVariant";

export function AddNewVariantButton() {
  let buttonRef: HTMLButtonElement;
  const [showDropdown, setShowDropdown] = createSignal(false);

  const addNewVariant = () => {
    setShowDropdown(true);
  };
  return (
    <>
      <button
        class="bg:blue-50 color:white mb:2 p:2 r:5"
        onClick={addNewVariant}
        ref={buttonRef!}
      >
        Add New Variant
      </button>
      <Show when={showDropdown()}>
        <ZIndex>
          <DropdownMenu
            class="r:5"
            onClickOutside={() => setShowDropdown(false)}
            parentRef={buttonRef!}
          >
            <AddNewVariant onClose={() => setShowDropdown(false)} />
          </DropdownMenu>
        </ZIndex>
      </Show>
    </>
  );
}
