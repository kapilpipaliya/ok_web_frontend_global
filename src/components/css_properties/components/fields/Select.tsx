import { Icon } from "@iconify-icon/solid";
import { makeEventListener } from "@solid-primitives/event-listener";
import { createSignal, For, type Setter, Show, splitProps } from "solid-js";

import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { ZIndex } from "~/components/ZIndex";

import type { SelectField } from "../../constants/FieldSchemaType";

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
    <div class={`${props.isLabelOnTop ? "w:full" : "w:50%"} rel`}>
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
          >
            <DropdownList
              options={props.options}
              selectOption={selectOption}
              value={props.value}
            />
          </DropdownMenu>
        </ZIndex>
      </Show>
    </div>
  );
};

interface DropdownButtonProps {
  isActive: boolean;
  setReference: Setter<HTMLElement | null>;
  toggleDropdown: () => void;
  value?: string;
}

const DropdownButton = (props: DropdownButtonProps) => (
  <div // NOSONAR
    classList={{
      "flex ai:center b:1px|solid|lightgray f:14 jc:space-between p:2|7 r:5": true,
      open: props.isActive,
    }}
    onClick={props.toggleDropdown}
    ref={props.setReference}
  >
    <button // NOSONAR Temparary ignore it
      aria-controls="select-dropdown"
      aria-expanded={props.isActive}
      aria-haspopup="listbox"
      aria-labelledby="select button"
      class="select-button"
      role="combobox"
    >
      <span class={`selected-value ${!props.value && "color:lightgray"}`}>
        {props.value ? formatString(props.value) : "Select Value"}
      </span>
      <span class="arrow" />
    </button>
    <Icon height={22} icon={"teenyicons:down-small-outline"} width={22} />
  </div>
);

interface DropdownListProps {
  options: any[];
  selectOption: (option: any) => void;
  value?: string;
}

const DropdownList = (props: DropdownListProps) => (
  <ul class="w:full">
    <For each={props.options}>
      {(option) => {
        const label = () => option.value || option;
        return (
          <li // NOSONAR
            classList={{
              "bg:#efefef:hover": props.value !== label(),
              "bg:rgb(229,234,253)": props.value === label(),
              "bg:rgb(229,234,253):hover": props.value === label(),
              "flex rel ai:center cursor:pointer f:14 jc:space-between p:5 r:5": true,
              "font-weight:medium": props.value === label(),
            }}
            onClick={() => props.selectOption(option)}
          >
            <label>{formatString(label())}</label>
            <Show when={props.value === label()}>
              <Icon
                class="color:dodgerblue"
                height={22}
                icon={"icon-park-outline:check-one"}
                width={22}
              />
            </Show>
          </li>
        );
      }}
    </For>
  </ul>
);
