import { type Accessor, For, Show } from "solid-js";

import type {
  AnotherOption,
  OptionType,
} from "~/features/css_editor/constants/FieldSchemaType";

import { ZIndex } from "~/components/fields/ZIndex";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

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
            useSize={true}
          >
            <As as="div" css={css`width: 100%;`}>
              <For each={props.options}>
                {(option) => (
                  <As
                    as="div"
                    css={css`
                      display: flex;
                      align-items: center;
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
                    {typeof option === "string" ? option : option.label}
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
