import { Icon } from "@iconify-icon/solid";
import { type Accessor, createSignal, For, Show } from "solid-js";

import type { TextFieldOptionsField } from "~/components/css_properties/constants/FieldSchemaType";

import { DropdownMenu } from "~/components/DropdownMenu";
import { ZIndex } from "~/components/ZIndex";

interface DropDownProps {
  isDropdownOpen: () => boolean;
  meta: TextFieldOptionsField;
  reference: Accessor<HTMLElement | null>;
  selectedOption: () => string;
  selectOption: (option: string) => void;
  setIsDropdownOpen: (isOpen: boolean) => void;
  toggleDropdown: (event: MouseEvent) => void;
}

export function UnitsDropdown(props: Readonly<DropDownProps>) {
  const [searchTerm, setSearchTerm] = createSignal("");

  const filteredOptions = () => {
    return props.meta.unitOptions?.filter((option) =>
      option.toLowerCase().includes(searchTerm().toLowerCase()),
    );
  };

  return (
    <Show when={props.meta.unitOptions}>
      <span // NOSONAR
        class={"color:lightgrey cursor:pointer f:14 ml:5 pr:5 user-select:none"}
        onClick={props.toggleDropdown}
      >
        {props.selectedOption?.()}
      </span>
      <Show when={props.isDropdownOpen()}>
        <ZIndex>
          <DropdownMenu
            onClickOutside={() => props.setIsDropdownOpen(false)}
            parentRef={props.reference()!}
          >
            <div class={"w:full"}>
              <input
                class="mb:5 p:5 w:full"
                onInput={(e) => setSearchTerm(e.currentTarget.value)}
                placeholder="Search..."
                type="text"
                value={searchTerm()}
              />
              <For each={filteredOptions()}>
                {(option) => (
                  <div // NOSONAR
                    class={`${
                      props.selectedOption?.() === option
                        ? "bg:rgb(229,234,253) font-weight:medium"
                        : "bg:transparent"
                    } flex ai:center bg:#efefef:hover cursor:pointer jc:space-between p:5 r:5`}
                    onClick={() => props.selectOption(option)}
                  >
                    {option}
                    <Show when={props.selectedOption?.() === option}>
                      <Icon icon={"mdi:check"} />
                    </Show>
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
