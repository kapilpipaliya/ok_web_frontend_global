import { type Accessor, For, Show } from "solid-js";

import { DropdownMenu } from "~/components/DropdownMenu";
import { ZIndex } from "~/components/ZIndex";

import type {
  AnotherOption,
  OptionType,
} from "../../constants/FieldSchemaType";

interface SuggestionsDropdownProps {
  isDropdownOpen: () => boolean;
  options: OptionType;
  reference: Accessor<HTMLElement | null>;
  selectOption: (option: AnotherOption | string) => void;
  setIsDropdownOpen: (isOpen: boolean) => void;
}

export function SuggestionsDropdown(props: Readonly<SuggestionsDropdownProps>) {
  return (
    <Show when={props.options}>
      <Show when={props.isDropdownOpen()}>
        <ZIndex>
          <DropdownMenu
            onClickOutside={() => props.setIsDropdownOpen(false)}
            parentRef={props.reference()!}
          >
            <div class={"w:full"}>
              <For each={props.options}>
                {(option) => (
                  <div // NOSONAR
                    class={
                      "flex ai:center bg:#efefef:hover cursor:pointer jc:space-between p:5 r:5"
                    }
                    onClick={() => props.selectOption(option)}
                  >
                    {typeof option === "string" ? option : option.label}
                  </div>
                )}
              </For>
            </div>
          </DropdownMenu>
        </ZIndex>
      </Show>
    </Show>
  );
}
