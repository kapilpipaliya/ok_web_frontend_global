import { Icon } from "@iconify-icon/solid";
import { type Accessor, createSignal, For, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";
import { DropdownMenu } from "~/components/styled/DropdownMenu";

interface DropDownProps {
  isDropdownOpen: () => boolean;
  reference: Accessor<HTMLElement | null>;
  selectedOption: () => string;
  selectOption: (option: string) => void;
  setIsDropdownOpen: (isOpen: boolean) => void;
  toggleDropdown: (event: MouseEvent) => void;
  unitOptions: string[]; // OptionType[];
}

export function UnitsDropdown(props: Readonly<DropDownProps>) {
  const [searchTerm, setSearchTerm] = createSignal("");

  const filteredOptions = () => {
    return props.unitOptions?.filter((option) =>
      option.toLowerCase().includes(searchTerm().toLowerCase()),
    );
  };

  return (
    <Show when={props.unitOptions}>
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
            useSize={true}
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
                      <Icon icon={"mdi:check"} noobserver />
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
