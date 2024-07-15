import { Icon } from "@iconify-icon/solid";
import { path } from "rambda";
import {
  For,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  Switch,
  Match,
} from "solid-js";

import type { TextFieldOptionsField } from "../constants/FieldType";

import { sizeTypes } from "../constants/constants";
import { useComponentMeta, useCssDefaultEditor, useCssEditor, useCssState } from "../context";
import { CenterDiv } from "./CenterDiv";
import { Container } from "./Container";
import { LabelWrapper } from "./LabelWrapper";

export const TextFieldWithSelect = () => {
  const meta = useComponentMeta() as TextFieldOptionsField;
  const [cssState, setCssState] = useCssEditor();
  const [state] = useCssState();
  const [cssDefault] = useCssDefaultEditor();
  const selectedValue = () => {
    const projections = [state() || "", ...(meta.projections ?? []), meta.name];
    return path(projections, cssState) ||
      path(projections, cssDefault) ||
      "";
  };

  const [startValue, setStartValue] = createSignal(selectedValue());
  const determineSelectedOption = () => {
    return sizeTypes.find((unit) => selectedValue().includes(unit)) ?? meta.options?.[0] ?? "px";
  };
  const [selectedOption, setOption] = createSignal(determineSelectedOption());

  const Content = () => {
    const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
    const [isMoving, setIsMoving] = createSignal(false);
    const [startY, setStartY] = createSignal(0);
    createEffect(() => {
      setOption(determineSelectedOption());
    });

    const handleChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const value = target.value;
      if (value === "") {
        setCssState(state(), ...(meta.projections ?? []), { [meta.name]: "" });
        return;
      }
      const numericValue = Number.parseFloat(value);
      if (meta.inputProps.min !== undefined && numericValue < meta.inputProps.min) {
        return;
      }
      if (meta.inputProps.max !== undefined && numericValue > meta.inputProps.max) {
        return;
      }
      if (meta.isAddToClass ?? true) {
        if (meta.options) {
          setCssState(state(), ...(meta.projections ?? []), { [meta.name]: `${value}${selectedOption()}` });
        } else {
          setCssState(state(), ...(meta.projections ?? []), { [meta.name]: `${numericValue}` });
        }
      }
      if (meta.onChangeInput) {
        meta.onChangeInput(`${numericValue}${selectedOption()}`);
      }
    };

    const toggleDropdown = (event: MouseEvent) => {
      event.stopPropagation(); // Prevent click from immediately closing the dropdown
      setIsDropdownOpen(!isDropdownOpen());
    };

    const selectOption = (option: string) => {
      if (option === "") {
        setIsDropdownOpen(false);
        setOption(option);
        setCssState(state(), ...(meta.projections ?? []), { [meta.name]: "" });
        return;
      }
      setIsDropdownOpen(false);
      setOption(option);
      const value = getValueWithoutUnits(selectedValue());
      setCssState(state(), ...(meta.projections ?? []), { [meta.name]: `${value}${option}` });
    };

    const getValueWithoutUnits = (valueWithUnits: string) => {
      if (!valueWithUnits) return "";
      const unitsToRemove = ["px", "%", "em", "rem", "vh", "vw"];
      const regexPattern = new RegExp(unitsToRemove.join("|"), "g");
      return Number.parseFloat(valueWithUnits.replace(regexPattern, ""));
    };

    // Function to normalize and set the new value based on mouse movement
    const moveIncrement = (event: MouseEvent) => {
      if (isMoving()) {
        const diff = startY() - event.pageY;
        let newValue = startValue() + diff;
        if (meta.inputProps.min !== undefined) {
          newValue = Math.max(newValue, meta.inputProps.min);
        }
        if (meta.inputProps.max !== undefined) {
          newValue = Math.min(newValue, meta.inputProps.max);
        }
        setCssState(state(), ...(meta.projections ?? []), {
          [meta.name]: `${newValue}${selectedOption()}`,
        });
      }
    };

    // Function to start the increment process
    const downIncrement = (event: MouseEvent) => {
      event.preventDefault();
      setIsMoving(true);
      setStartY(event.pageY);
      setStartValue(
        getValueWithoutUnits(meta.value ? meta.value() : selectedValue()),
      );

      document.addEventListener("mousemove", moveIncrement);
      document.addEventListener("mouseup", upIncrement);
    };

    // Function to stop the increment process
    const upIncrement = () => {
      setIsMoving(false);
      document.removeEventListener("mousemove", moveIncrement);
      document.removeEventListener("mouseup", upIncrement);
    };

    // Clean up event listeners when the component unmounts
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
              fallback={<button
                class="bg:transparent border:none cursor:ns-resize"
                onMouseDown={downIncrement}
              >
                <Icon class="color:grey" icon="gg:scroll-v" />
              </button>}
              when={meta.type !== "number"}
            >
              {meta.leftIcon}
            </Show>
          </Show>
          <Show
            fallback={<label>
              {meta.label}
              <input
                class={"f:14 w:100%"}
                onInput={handleChange}
                placeholder={`${meta.type === "number" ? "0" : meta.placeholder ?? ""}`}
                step="any"
                type={meta.type || "text"}
                value={getValueWithoutUnits(selectedValue())}
                {...meta.inputProps} />
            </label>}
            when={meta.showInside}
          >
            <input
              class="f:14 outline:none p:5 w:100%"
              onInput={handleChange}
              placeholder={`${meta.type === "number" ? "0" : meta.placeholder ?? ""}`}
              step="any"
              type={meta.type || "text"}
              value={getValueWithoutUnits(
                meta.value ? meta.value() : selectedValue()
              )}
              {...meta.inputProps} />
          </Show>
        </div>
        <Show when={meta.options}>
          <span
            class={"color:lightgrey cursor:pointer f:14 ml:5 pr:5 user-select:none"}
            onClick={toggleDropdown}
          >
            {selectedOption?.()}
          </span>
          <Show when={isDropdownOpen()}>
            <div
              class={"abs bg:white box-shadow:0px|2px|5px|rgba(0,0,0,0.2) left:0 p:5 r:5 top:100% w:full z-index:1000"}
            >
              <For each={meta.options}>
                {(option) => (
                  <div
                    class={`${selectedOption?.() === option
                      ? "bg:rgb(229,234,253) font-weight:medium"
                      : "bg:transparent"} flex ai:center bg:#efefef:hover cursor:pointer jc:space-between p:5 r:5`}
                    onClick={() => selectOption(option)}
                  >
                    {option}
                    <Show when={selectedOption?.() === option}>
                      <Icon icon={"mdi:check"} />
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Show>
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
