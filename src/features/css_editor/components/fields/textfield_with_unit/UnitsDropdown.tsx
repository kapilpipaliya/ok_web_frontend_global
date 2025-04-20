import { Icon } from "@iconify-icon/solid";
import { type Accessor, createSignal, For, Show } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

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
      <As
        as="span"
        css={css`
          color: lightgrey;
          cursor: pointer;
          font-size: 14px;
          margin-left: 5px;
          padding-right: 5px;
          user-select: none;
        `}
        onClick={props.toggleDropdown}
      >
        {props.selectedOption?.()}
      </As>
      <Show when={props.isDropdownOpen()}>
        <ZIndex>
          <DropdownMenu
            onClickOutside={() => props.setIsDropdownOpen(false)}
            parentRef={props.reference()!}
            useSize={true}
          >
            <As as="div" css={css`width: 100%;`}>
              <As
                as="input"
                css={css`
                  margin-bottom: 5px;
                  padding: 5px;
                  width: 100%;
                `}
                onInput={(e) => setSearchTerm(e.currentTarget.value)}
                placeholder="Search..."
                type="text"
                value={searchTerm()}
              />
              <For each={filteredOptions()}>
                {(option) => (
                  <As
                    as="div"
                    css={css`
                      display: flex;
                      align-items: center;
                      background: ${props.selectedOption?.() === option ? "rgb(229,234,253)" : "transparent"};
                      font-weight: ${props.selectedOption?.() === option ? "500" : "normal"};
                      cursor: pointer;
                      justify-content: space-between;
                      padding: 5px;
                      border-radius: 5px;
                      &:hover {
                        background: #efefef;
                      }
                    `}
                    onClick={() => props.selectOption(option)}
                  >
                    {option}
                    <Show when={props.selectedOption?.() === option}>
                      <Icon icon={"ph:check"} noobserver />
                    </Show>
                  </As>
                )}
              </For>
            </As>
          </DropdownMenu>
        </ZIndex>
      </Show>
    </Show>
  );
}
