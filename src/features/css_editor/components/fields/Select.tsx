import { Icon } from "@iconify-icon/solid";
import { makeEventListener } from "@solid-primitives/event-listener";
import { createSignal, For, type Setter, Show, splitProps } from "solid-js";

import { ZIndex } from "~/components/fields/ZIndex";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";

import type { SelectField } from "../../constants/FieldSchemaType";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

function formatString(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const Select = (props: Readonly<SelectField>) => {
  const [isActive, setIsActive] = createSignal(false);

  const toggleDropdown = () => setIsActive(!isActive());

  const [local, _others] = splitProps(props, ["componentName", "onChange"]);

  const selectOption = (option: any) => {
    local.onChange?.(option.value || option);
    setIsActive(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const dropdown = document.getElementById(`select-dropdown${props.label}`);
    if (dropdown && !dropdown.contains(event.target as Node)) {
      setIsActive(false);
    }
  };
  makeEventListener(document, "mousedown", handleClickOutside);

  const [reference, setReference] = createSignal<HTMLElement | null>(null);

  return (
    <As
      as="div"
      css={css`
  ${props.isLabelOnTop ? "width: 100%" : "width: 50%"}
  position: relative;
`}
    >
      <DropdownButton
        isActive={isActive()}
        setReference={setReference}
        toggleDropdown={toggleDropdown}
        value={props.value}
      />
      <Show when={isActive()}>
        <ZIndex>
          <DropdownMenu
            onClickOutside={() => setIsActive(false)}
            parentRef={reference()!}
            useSize={true}
          >
            <DropdownList
              options={props.options}
              selectOption={selectOption}
              value={props.value}
            />
          </DropdownMenu>
        </ZIndex>
      </Show>
    </As>
  );
};

interface DropdownButtonProps {
  isActive: boolean;
  setReference: Setter<HTMLElement | null>;
  toggleDropdown: () => void;
  value?: string;
}

const DropdownButton = (props: DropdownButtonProps) => (
  <As
    as="div"
    css={[
      css`
        display: flex;
        align-items: center;
        border: 1px solid lightgray;
        font-size: 14px;
        justify-content: space-between;
        padding: 2px 7px;
        border-radius: 5px;
      `,
    ]}
    onClick={props.toggleDropdown}
    ref={props.setReference}
  >
    <As
      as="button" // NOSONAR Temparary ignore it
      aria-controls="select-dropdown"
      aria-expanded={props.isActive}
      aria-haspopup="listbox"
      aria-labelledby="select button"
      class="select-button"
      role="combobox"
    >
      <As
        as="span"
        css={css`
  ${props.value ? "color: lightgray" : ""}
`}
      >
        {props.value ? formatString(props.value) : "Select Value"}
      </As>
      <As
        as="span"
        css={css`
  /* arrow */
`}
      />
    </As>
    <Icon
      height={16}
      icon={"ph:caret-down"}
      noobserver
      style={{
        transform: props.isActive ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
      }}
      width={16}
    />
  </As>
);

interface DropdownListProps {
  options: any[];
  selectOption: (option: any) => void;
  value?: string;
}

const DropdownList = (props: DropdownListProps) => (
  <As
    as="ul"
    css={css`
  width: 100%;
`}
  >
    <For each={props.options}>
      {(option) => {
        const label = () => option.value || option;
        return (
          <As
            as="li"
            css={[
              css`
                ${props.value === label() && "bg:rgb(229,234,253)"}
                display: flex;
                position: relative;
                align-items: center;
                cursor: pointer;
                font-size: 14px;
                justify-content: space-between;
                padding: 5px;
                border-radius: 5px;
                ${props.value === label() && "font-weight:medium"}
                hover: {
                  ${props.value !== label() && "bg:#efefef"}
                }
            `,
            ]}
            onClick={() => props.selectOption(option)}
          >
            <label>{formatString(label())}</label>
            <Show when={props.value === label()}>
              <Icon
                css={css`
  color: dodgerblue;
`}
                height={22}
                icon={"icon-park-outline:check-one"}
                noobserver
                width={22}
              />
            </Show>
          </As>
        );
      }}
    </For>
  </As>
);
