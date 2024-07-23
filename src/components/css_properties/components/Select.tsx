import { Icon } from "@iconify-icon/solid";
import { makeEventListener } from "@solid-primitives/event-listener";
import { path } from "rambda";
import { For, Match, Show, Switch, createSignal } from "solid-js";

import { useZIndex } from "~/components/ZIndex";

import type { SelectField } from "../constants/FieldType";

import { useComponentMeta, useCssDefaultEditor, useCssEditor, useCssState } from "../CssEditorContext";
import { Container } from "./Container";
import { LabelWrapper } from "./LabelWrapper";
function formatString(str: string) {
  return str
    .split("-") // Split the string by hyphen
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each part
    .join(" "); // Join the parts with a space
}
export const Select = () => {
  const meta = useComponentMeta() as SelectField;
  const [cssState, setCssState] = useCssEditor();
  const [state, setState] = useCssState();
  const [cssDefault, setCssDefault] = useCssDefaultEditor();
  const [isActive, setIsActive] = createSignal(false);
  const toggleDropdown = () => setIsActive(!isActive());
  const zIndex = useZIndex();
  const selectedValue = () =>
    {
      const projections = [state() || "", ...(meta.projections ?? []), meta.name];
      return path(projections, cssState) ||
        path(projections, cssDefault) ||
        meta.value ||
        "";
    };

  const selectOption = (option: any) => {
    if (meta.isAddToClass ?? true) {
      setCssState(state(), ...(meta.projections ?? []), { [meta.name]: option.value || option });
    }
    if (meta.onChangeInput)
      meta.onChangeInput(meta.name, option.value || option);
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
            <LabelWrapper/>
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
    return (
      <div class={`${meta.isLabelOnTop ? "w:full" : "w:50%"} rel`}>
        <div
          classList={{
            "flex ai:center b:1px|solid|lightgray f:14 jc:space-between p:2|7 r:5": true,
            open: isActive(),
          }}
          onClick={toggleDropdown}
        >
          <button
            aria-controls={`select-dropdown${meta.label}`}
            aria-expanded={isActive()}
            aria-haspopup="listbox"
            aria-labelledby="select button"
            class="select-button"
            role="combobox"
          >
            <span class={`selected-value ${!selectedValue() && "color:lightgray"}`}>
              {selectedValue() ? formatString(selectedValue()) : `Select Value`}
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
          class={`{scrollbar-width:thin} border-radius:.28571429rem border:1px|solid|rgba(34,36,38,.15) box-shadow:-1px|0px|14px|3px|rgba(17,36,38,.15) cursor:auto max-h:15rem outline:0 overflow:auto position:absolute text-align:left text-shadow:none top:100% transition:opacity|.1s|ease will-change:transform,opacity z-index:${zIndex}`}
          classList={{
            "b:1px|solid|lightgray bg:white mt:2 p:4|10 r:5 w:full": true,
            hidden: !isActive(),
            visible: isActive(),
          }}
          id={`select-dropdown${meta.label}`}
        >
          <For each={meta.options}>
            {(option) => {
              const label = () => option.value || option;
              return (
                <li
                  classList={{
                    "bg:#efefef:hover": selectedValue() !== label(),
                    "bg:rgb(229,234,253)": selectedValue() === label(),
                    "bg:rgb(229,234,253):hover": selectedValue() === label(),
                    "flex rel ai:center cursor:pointer f:14 jc:space-between p:5 r:5": true,
                    "font-weight:medium": selectedValue() === label(),
                  }}
                  onClick={() => selectOption(option)}
                >
                  <label>{formatString(label())}</label>
                  <Show when={selectedValue() === label()}>
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
