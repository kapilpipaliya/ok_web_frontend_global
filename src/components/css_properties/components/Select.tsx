import { Icon } from "@iconify-icon/solid";
import { makeEventListener } from "@solid-primitives/event-listener";
import { path } from "rambda";
import { For, Match, type Setter, Show, Switch, createSignal } from "solid-js";

import { DropdownMenu } from "~/components/DropdownMenu";
import { ZIndex } from "~/components/ZIndex";

import type { SelectField } from "../constants/FieldType";

import { useComponentMeta, useCssDefaultEditor, useCssEditor, useCssState } from "../CssEditorContext";
import { Container } from "./Container";
import { LabelWrapper } from "./LabelWrapper";

function formatString(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const Select = () => {
  const meta = useComponentMeta() as SelectField;
  const [cssState, setCssState] = useCssEditor();
  const [state] = useCssState();
  const [cssDefault] = useCssDefaultEditor();
  const [isActive, setIsActive] = createSignal(false);

  const toggleDropdown = () => setIsActive(!isActive());

  const selectedValue = (): string => {
    const projections = [state() || "", ...(meta.projections ?? []), meta.name];
    return (
      path(projections, cssState) ||
      path(projections, cssDefault) ||
      meta.value ||
      ""
    );
  };

  const selectOption = (option: any) => {
    if (meta.isAddToClass ?? true) {
      setCssState(state(), ...(meta.projections ?? []), {
        [meta.name]: option.value || option,
      });
    }
    if (meta.onChangeInput) meta.onChangeInput(meta.name, option.value || option);
    setIsActive(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const dropdown = document.getElementById(`select-dropdown${meta.label}`);
    if (dropdown && !dropdown.contains(event.target as Node)) {
      setIsActive(false);
    }
  };
  makeEventListener(document, "mousedown", handleClickOutside);

  return (
    <Container>
      <Switch>
        <Match when={meta.isLabelOnTop}>
          <div class={"w:full"}>
            <LabelWrapper />
            <Content />
          </div>
        </Match>
        <Match when={meta.label}>
          <div class={"flex ai:center jc:space-between w:100%"}>
            <LabelWrapper />
            <Content />
          </div>
        </Match>
        <Match when={true}>
          <Content />
        </Match>
      </Switch>
    </Container>
  );

  function Content() {
    const [reference, setReference] = createSignal<HTMLElement | null>(null);

    return (
      <div class={`${meta.isLabelOnTop ? "w:full" : "w:50%"} rel`}>
        <DropdownButton
          isActive={isActive()}
          selectedValue={selectedValue()}
          setReference={setReference}
          toggleDropdown={toggleDropdown}
        />
        <Show when={isActive()}>
          <ZIndex>
            <DropdownMenu onClickOutside={() => setIsActive(false)} parentRef={reference()!}>
              <DropdownList
                options={meta.options}
                selectOption={selectOption}
                selectedValue={selectedValue()}
              /></DropdownMenu>
          </ZIndex>
        </Show>
      </div>
    );
  }
};

interface DropdownButtonProps {
  isActive: boolean;
  selectedValue: string;
  setReference: Setter<HTMLElement | null>;
  toggleDropdown: () => void;
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
      <span class={`selected-value ${!props.selectedValue && "color:lightgray"}`}>
        {props.selectedValue ? formatString(props.selectedValue) : `Select Value`}
      </span>
      <span class="arrow" />
    </button>
    <Icon height={22} icon={"teenyicons:down-small-outline"} width={22} />
  </div>
);

interface DropdownListProps {
  options: any[];
  selectOption: (option: any) => void;
  selectedValue: string;
}

const DropdownList = (props: DropdownListProps) => (
  <ul class="w:full">
    <For each={props.options}>
      {(option) => {
        const label = () => option.value || option;
        return (
          <li // NOSONAR
            classList={{
              "bg:#efefef:hover": props.selectedValue !== label(),
              "bg:rgb(229,234,253)": props.selectedValue === label(),
              "bg:rgb(229,234,253):hover": props.selectedValue === label(),
              "flex rel ai:center cursor:pointer f:14 jc:space-between p:5 r:5": true,
              "font-weight:medium": props.selectedValue === label(),
            }}
            onClick={() => props.selectOption(option)}
          >
            <label>{formatString(label())}</label>
            <Show when={props.selectedValue === label()}>
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
