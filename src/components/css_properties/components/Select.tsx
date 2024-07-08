import { Icon } from "@iconify-icon/solid";
import { makeEventListener } from "@solid-primitives/event-listener";
import {
  For,
  Match,
  Show,
  Switch,
  createMemo,
  createSignal,
  
} from "solid-js";

import type { SelectField } from "../constants/FieldType";

import { useCssDefaultEditor, useCssEditor, useCssState } from "../context";
import { Container } from "./Container";
import { ContainerLabel } from "./ContainerLabel";
  function formatString(str: string) {
    return str
      .split("-") // Split the string by hyphen
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each part
      .join(" "); // Join the parts with a space
  }
export const Select = (props: SelectField) => {


  const [cssState, setCssState] = useCssEditor();
  const [state, setState] = useCssState();
  const [cssDefault, setCssDefault] = useCssDefaultEditor();
  const [isActive, setIsActive] = createSignal(false);
  const toggleDropdown = () => setIsActive(!isActive());
  const selected = () =>
    cssState[state() ?? '']?.[props.name] || cssDefault[state() ?? '']?.[props.name] || props.value || '';
  
  const selectOption = (option: any) => {
    if (props.isAddToClass) {
      setCssState(state(), {[props.name]: option.value || option});
    }
    if (props.onChangeInput)
      props.onChangeInput(props.name, option.value || option);
    setIsActive(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const dropdown = document.getElementById(`select-dropdown${props.label}`);
    if (dropdown && !dropdown.contains(event.target as Node)) {
      setIsActive(false);
    }
  };
  makeEventListener(document, "mousedown", handleClickOutside);
  const isDefaultValue = createMemo(() => selected() !== cssDefault[state() ?? '']?.[props.name] && selected() !== '');
  return (
    <Container>
      <Switch>
        <Match when={props.isLabelOnTop}>
          <div class={"w:full"}>
            <ContainerLabel info={props.infoLink || props.name} onIconClick={() => {
              if (props.value) {
                props.onRemoveIconClick?.();
              }
              setCssState(state(), { [props.name]: cssDefault[state() ?? '']?.[props.name] })
                       }} showIcon={isDefaultValue()} title={props.label} />
            <Content />
          </div>
        </Match>
        <Match when={props.label}>
          <div class={"flex ai:center jc:space-between w:100%"}>
            <ContainerLabel info={props.infoLink || props.name} onIconClick={() => {
              setCssState(state(), { [props.name]: cssDefault[state() ?? '']?.[props.name] })
              if (props.value) {
                props.onRemoveIconClick?.();
              }
            }} showIcon={isDefaultValue()} title={props.label} />
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
    return (
      <div class={`${props.isLabelOnTop ? "w:full" : "w:50%"} rel`}>
        <div
          class={`${isActive() ? "open" : ""
            } flex ai:center b:1px|solid|lightgray f:14 jc:space-between p:2|7 r:5`}
          onClick={toggleDropdown}
        >
          <button
            aria-controls={`select-dropdown${props.label}`}
            aria-expanded={isActive()}
            aria-haspopup="listbox"
            aria-labelledby="select button"
            class="select-button"
            role="combobox"
          >
            <span class={`selected-value ${!selected() && "color:lightgray"}`}>{selected() ? formatString(selected()) : `Select Value`}</span>
            <span class="arrow" />
          </button>
          <div>
            <Icon
              height={22}
              icon={"teenyicons:down-small-outline"}
              width={22}
            />
          </div>
        </div>

        <ul
          class={`popup ${isActive() ? "visible" : "hidden"
            } b:1px|solid|lightgray bg:white mt:2 p:4|10 r:5 w:-webkit-fill-available`}
          id={`select-dropdown${props.label}`}
          style={
            "max-height: 15rem;overflow: auto;scrollbar-width:thin;cursor: auto;position: absolute;outline: 0;top: 100%;text-shadow: none;text-align: left;box-shadow: -1px 0px 14px 3px rgba(17,36,38,.15);border: 1px solid rgba(34,36,38,.15);border-radius: .28571429rem;transition: opacity .1s ease;z-index: 11;will-change: transform,opacity;"
          }
        >
          <For each={props.options}>
            {(option) => {
              const label = () => option.value || option;
              return (
                <li
                  class={`${selected() !== label()
                    ? "bg:#efefef:hover"
                    : "bg:rgb(229,234,253):hover"
                    } ${selected() === label() ? "bg:rgb(229,234,253)" : ""
                    } flex rel ai:center cursor:pointer f:14 font-weight:${selected() === label() ? "medium" : ""} jc:space-between p:5 r:5`}
                  onClick={() => selectOption(option)}
                >
                  <label>{formatString(label())}</label>
                  <Show when={selected() === label()}>
                    <Icon
                      height={22}
                      icon={"icon-park-outline:check-one"}
                      style={{ color: "dodgerblue" }}
                      width={22}
                    />
                  </Show>
                </li>
              );
            }}
          </For>
        </ul>
      </div>
    );
  }
};
