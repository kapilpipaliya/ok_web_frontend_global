import { createSignal, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";
import { DropdownMenu } from "~/components/styled/DropdownMenu";

import { AddNewRule } from "./AddNewRule";

export function AddNewRuleButton() {
  let buttonRef: HTMLButtonElement;
  const [showDropdown, setShowDropdown] = createSignal(false);

  const addNewRule = () => {
    setShowDropdown(true);
  };
  return (
    <>
      <button
        class="bg:blue-50 color:white mb:2 p:2 r:5"
        onClick={addNewRule}
        ref={buttonRef!}
      >
        Add New Rule
      </button>
      <Show when={showDropdown()}>
        <ZIndex>
          <DropdownMenu
            class="r:5"
            onClickOutside={() => setShowDropdown(false)}
            parentRef={buttonRef!}
          >
            <AddNewRule onClose={() => setShowDropdown(false)} />
          </DropdownMenu>
        </ZIndex>
      </Show>
    </>
  );
}
