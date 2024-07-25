import { Icon } from "@iconify-icon/solid";
import { path } from "rambda";
import {
  Component,
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js";

import type { TextFieldOptionsField } from "../constants/FieldType";

import { useComponentMeta, useCssDefaultEditor, useCssEditor, useCssState } from "../CssEditorContext";
import { sizeTypes } from "../constants/constants";
import { CenterDiv } from "./CenterDiv";
import { Container } from "./Container";
import { LabelWrapper } from "./LabelWrapper";

function getValueWithoutUnits(valueWithUnits: string): number {
  if (!valueWithUnits) return 0;
  const unitsToRemove = ["px", "%", "em", "rem", "vh", "vw"];
  const regexPattern = new RegExp(unitsToRemove.join("|"), "g");
  return Number.parseFloat(valueWithUnits.replace(regexPattern, ""));
}

export const TextFieldWithSelect: Component = () => {
  const meta = useComponentMeta() as TextFieldOptionsField;
  const [cssState, setCssState] = useCssEditor();
  const [state] = useCssState();
  const [cssDefault] = useCssDefaultEditor();

  const selectedValue = (): string => {
    const projections = [state() || "", ...(meta.projections ?? []), meta.name];
    return path(projections, cssState) || path(projections, cssDefault) || "";
  };

  const [startValue, setStartValue] = createSignal<number | string>(selectedValue());
  const [selectedOption, setOption] = createSignal(determineSelectedOption());

  createEffect(() => setOption(determineSelectedOption()));

  function determineSelectedOption(): string {
    return sizeTypes.find((unit) => selectedValue().includes(unit)) ?? meta.options?.[0] ?? "";
  }

  function changeValue(value: string) {
    if (meta.isAddToClass ?? true) {
      setCssState(state(), ...(meta.projections ?? []), { [meta.name]: value });
    }
    meta.onChangeInput?.(value);
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    if (value === "") {
      changeValue("");
      return;
    }
    const numericValue = Number.parseFloat(value);
    if (meta.inputProps?.min !== undefined && numericValue < meta.inputProps.min) {
      return;
    }
    if (meta.inputProps?.max !== undefined && numericValue > meta.inputProps.max) {
      return;
    }
    if (meta.options) {
      changeValue(`${value}${selectedOption()}`);
    } else {
      changeValue(`${numericValue}`);
    }
  }

  const Content: Component = () => {
    const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
    const [isMoving, setIsMoving] = createSignal(false);
    const [startY, setStartY] = createSignal(0);

    const toggleDropdown = (event: MouseEvent) => {
      event.stopPropagation(); // Prevent click from immediately closing the dropdown
      setIsDropdownOpen(!isDropdownOpen());
    };

    const selectOption = (option: string) => {
      setIsDropdownOpen(false);
      setOption(option);
      const value = getValueWithoutUnits(selectedValue());
      changeValue(`${value}${option}`);
    };

    const moveIncrement = (event: MouseEvent) => {
      if (isMoving()) {
        const diff = startY() - event.pageY;
        let newValue = startValue() + diff;
        if (meta.inputProps?.min !== undefined) {
          newValue = Math.max(newValue, meta.inputProps.min);
        }
        if (meta.inputProps?.max !== undefined) {
          newValue = Math.min(newValue, meta.inputProps.max);
        }
        changeValue(`${newValue}${selectedOption()}`);
      }
    };

    const downIncrement = (event: MouseEvent) => {
      event.preventDefault();
      setIsMoving(true);
      setStartY(event.pageY);
      setStartValue(getValueWithoutUnits(selectedValue()));
      document.addEventListener("mousemove", moveIncrement);
      document.addEventListener("mouseup", upIncrement);
    };

    const upIncrement = () => {
      setIsMoving(false);
      document.removeEventListener("mousemove", moveIncrement);
      document.removeEventListener("mouseup", upIncrement);
    };

    onCleanup(() => {
      document.removeEventListener("mousemove", moveIncrement);
      document.removeEventListener("mouseup", upIncrement);
    });

    return (
      <div
        class={`${meta.showInside ? "b:1px|solid|#ccc" : ""} ${meta.showInside ? "p:0|5|0|5" : ""} ${!meta.isLabelOnTop ? "max-w:50%" : ""} flex rel ai:center jc:space-between r:5`}
      >
        <div class={"flex ai:center flex:1"}>
          <Show when={meta.leftIcon || meta.type === "number"}>
            <Show
              fallback={<IncrementButton downIncrement={downIncrement} />}
              when={meta.type !== "number"}
            >
              {meta.leftIcon}
            </Show>
          </Show>
          <InputField handleChange={handleChange} meta={meta} selectedValue={selectedValue} />
        </div>
        <Dropdown
          isDropdownOpen={isDropdownOpen}
          meta={meta}
          selectOption={selectOption}
          selectedOption={selectedOption}
          toggleDropdown={toggleDropdown}
        />
      </div>
    );
  };

  const resetValue = () => {
    setStartValue(cssDefault[state() ?? ""]?.[meta.name]);
    setOption(determineSelectedOption());
  };

  return (
    <Container>
      <Switch>
        <Match when={meta.isLabelOnTop}>
          <div class={"w:full"}>
            <LabelWrapper onResetIconClick={resetValue} />
            <Content />
          </div>
        </Match>
        <Match when={meta.label}>
          <CenterDiv>
            <LabelWrapper onResetIconClick={resetValue} />
            <Content />
          </CenterDiv>
        </Match>
        <Match when={true}>
          <Content />
        </Match>
      </Switch>
    </Container>
  );
};

const InputField: Component<{ handleChange: (event: Event) => void; meta: TextFieldOptionsField; selectedValue: () => string; }> = (props) => (
  <Show
    fallback={<label>
      {props.meta.label}
      <input
        class={"f:14 w:100%"}
        onInput={props.handleChange}
        placeholder={`${props.meta.type === "number" ? "0" : props.meta.placeholder ?? ""}`}
        step="any"
        type={props.meta.type || "text"}
        value={getValueWithoutUnits(props.selectedValue())}
        {...props.meta.inputProps} />
    </label>}
    when={props.meta.showInside}
  >
    <input
      class="f:14 outline:none p:5 w:100%"
      onInput={props.handleChange}
      placeholder={`${props.meta.type === "number" ? "0" : props.meta.placeholder ?? ""}`}
      step="any"
      type={props.meta.type || "text"}
      value={getValueWithoutUnits(
        props.meta.value ? props.meta.value() : props.selectedValue()
      )}
      {...props.meta.inputProps} />
  </Show>
);

const Dropdown: Component<{ isDropdownOpen: () => boolean; meta: TextFieldOptionsField; selectOption: (option: string) => void; selectedOption: () => string; toggleDropdown: (event: MouseEvent) => void; }> = (props) => (
  <Show when={props.meta.options}>
    <span // NOSONAR
      class={"color:lightgrey cursor:pointer f:14 ml:5 pr:5 user-select:none"}
      onClick={props.toggleDropdown}
    >
      {props.selectedOption?.()}
    </span>
    <Show when={props.isDropdownOpen()}>
      <div
        class={"abs bg:white box-shadow:0px|2px|5px|rgba(0,0,0,0.2) left:0 p:5 r:5 top:100% w:full z-index:1000"}
      >
        <For each={props.meta.options}>
          {(option) => (
            <div // NOSONAR
              class={`${props.selectedOption?.() === option
                ? "bg:rgb(229,234,253) font-weight:medium"
                : "bg:transparent"} flex ai:center bg:#efefef:hover cursor:pointer jc:space-between p:5 r:5`}
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
    </Show>
  </Show>
);

const IncrementButton: Component<{ downIncrement: (event: MouseEvent) => void }> = (props) => (
  <button
    class="bg:transparent border:none cursor:ns-resize"
    onMouseDown={props.downIncrement}
  >
    <Icon class="color:grey" icon="gg:scroll-v" />
  </button>
);
