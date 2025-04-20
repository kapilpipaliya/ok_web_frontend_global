import { createSignal, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";

import { AddNewVariant } from "./AddNewVariant";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function AddNewVariantButton() {
  let buttonRef: HTMLButtonElement;
  const [showDropdown, setShowDropdown] = createSignal(false);

  const addNewVariant = () => {
    setShowDropdown(true);
  };
  return (
    <>
      <As
        as="button"
        css={css`
  background-color: \${args.theme.var.color.primary};
  color: #1e293b;
  margin-bottom: 2px;
  padding: 2px;
  border-radius: 5px;
`}
        onClick={addNewVariant}
        ref={buttonRef!}
      >
        Add New Variant
      </As>
      <Show when={showDropdown()}>
        <ZIndex>
          <DropdownMenu
            css={css`
  border-radius: 5px;
`}
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
