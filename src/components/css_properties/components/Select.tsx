import { Icon } from "@iconify-icon/solid";
import { makeEventListener } from "@solid-primitives/event-listener";
import { For, Match, Show, Switch, createMemo, createSignal } from "solid-js";

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
    cssState[state() ?? ""]?.[props.name] ||
    cssDefault[state() ?? ""]?.[props.name] ||
    props.value ||
    "";

  const selectOption = (option: any) => {
    if (props.isAddToClass) {
      setCssState(state(), { [props.name]: option.value || option });
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
  const isDefaultValue = createMemo(
    () =>
      selected() !== cssDefault[state() ?? ""]?.[props.name] &&
      selected() !== "",
  );
  return (
    <Container>
      <Switch>
        <Match when={props.isLabelOnTop}>
          <div class={"w:full"}>
            <ContainerLabel
              info={props.infoLink || props.name}
              onResetIconClick={() => {
                if (props.value) {
                  props.onRemoveIconClick?.();
                }
                setCssState(state(), {
                  [props.name]: cssDefault[state() ?? ""]?.[props.name],
                });
              }}
              showResetIcon={isDefaultValue()}
              title={props.label}
            />
            <Content />
          </div>
        </Match>
        <Match when={props.label}>
          <div class={"flex ai:center jc:space-between w:100%"}>
            <ContainerLabel
              info={props.infoLink || props.name}
              onResetIconClick={() => {
                setCssState(state(), {
                  [props.name]: cssDefault[state() ?? ""]?.[props.name],
                });
                if (props.value) {
                  props.onRemoveIconClick?.();
                }
              }}
              showResetIcon={isDefaultValue()}
              title={props.label}
            />
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
          classList={{
            "flex ai:center b:1px|solid|lightgray f:14 jc:space-between p:2|7 r:5": true,
            open: isActive(),
          }}
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
            <span class={`selected-value ${!selected() && "color:lightgray"}`}>
              {selected() ? formatString(selected()) : `Select Value`}
            </span>
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
          class="scrollbar-width:thin border-radius:.28571429rem border:1px|solid|rgba(34,36,38,.15) box-shadow:-1px|0px|14px|3px|rgba(17,36,38,.15) cursor:auto max-h:15rem outline:0 overflow:auto position:absolute text-align:left text-shadow:none top:100% transition:opacity|.1s|ease will-change:transform,opacity z-index:11"
          classList={{
            hidden: !isActive(),
            "popup b:1px|solid|lightgray bg:white mt:2 p:4|10 r:5 w:full": true,
            visible: isActive(),
          }}
          id={`select-dropdown${props.label}`}
        >
          <For each={props.options}>
            {(option) => {
              const label = () => option.value || option;
              return (
                <li
                  classList={{
                    "bg:#efefef:hover": selected() !== label(),
                    "bg:rgb(229,234,253)": selected() === label(),
                    "bg:rgb(229,234,253):hover": selected() === label(),
                    "flex rel ai:center cursor:pointer f:14 jc:space-between p:5 r:5": true,
                    "font-weight:medium": selected() === label(),
                  }}
                  onClick={() => selectOption(option)}
                >
                  <label>{formatString(label())}</label>
                  <Show when={selected() === label()}>
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
      </div>
    );
  }
};
