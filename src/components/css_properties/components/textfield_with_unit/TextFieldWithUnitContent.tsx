import { createWritableMemo } from "@solid-primitives/memo";
import { type Component, createSignal, onCleanup, Show } from "solid-js";

import type { OptionType } from "../../constants/FieldSchemaType";

import { FilePickerButton } from "./FilePickerButton";
import { getValueWithoutUnits } from "./getValueWithoutUnits";
import { IncrementButton } from "./IncrementButton";
import { InputField } from "./InputField";
import { SuggestionsDropdown } from "./SuggestionsDropdown";
import { UnitsDropdown } from "./UnitsDropdown";

interface ContentProps {
  changeValue: (value: string) => void;
  determineSelectedOption: () => string;
  handleInputChange: (event: Event) => void;
  meta: any; // Define the proper type here
  value: string;
}

export const TextFieldWithUnitContent: Component<ContentProps> = (props) => {
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [isMoving, setIsMoving] = createSignal(false);
  const [startY, setStartY] = createSignal(0);
  const [startValue, setStartValue] = createWritableMemo<number | string>(
    () => props.value,
  );
  const [selectedUnitOption, setSelectedUnitOption] = createSignal(
    props.determineSelectedOption(),
  );
  const [reference, setReference] = createSignal<HTMLElement | null>(null);

  // State used to display text options
  const [_inputValue, setInputValue] = createSignal("");
  const [isAnotherDropdownOpen, setIsAnotherDropdownOpen] = createSignal(false);
  const [filteredOptions, setFilteredOptions] = createSignal<OptionType>([]);

  const toggleDropdown = (event: MouseEvent) => {
    event.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen());
  };

  const selectOption = (option: string) => {
    setIsDropdownOpen(false);
    setSelectedUnitOption(option);
    const value = getValueWithoutUnits(props.value);
    props.changeValue(`${value}${option}`);
  };

  const moveIncrement = (event: MouseEvent) => {
    if (isMoving()) {
      const diff = startY() - event.pageY;
      let newValue =
        Number(getValueWithoutUnits(startValue() as string)) + diff;
      newValue = clampValue(newValue);
      props.changeValue(`${newValue}${selectedUnitOption()}`);
    }
  };

  const downIncrement = (event: MouseEvent) => {
    event.preventDefault();
    setIsMoving(true);
    setStartY(event.pageY);
    setStartValue(getValueWithoutUnits(props.value));
    document.addEventListener("mousemove", moveIncrement);
    document.addEventListener("mouseup", upIncrement);
  };

  const upIncrement = () => {
    setIsMoving(false);
    document.removeEventListener("mousemove", moveIncrement);
    document.removeEventListener("mouseup", upIncrement);
  };

  function clampValue(value: number): number {
    if (props.meta.inputProps?.min !== undefined) {
      value = Math.max(value, props.meta.inputProps.min);
    }
    if (props.meta.inputProps?.max !== undefined) {
      value = Math.min(value, props.meta.inputProps.max);
    }
    return value;
  }

  const handleInputChange = (event: Event) => {
    props.handleInputChange(event);
    const target = event.target as HTMLInputElement;
    const value = target.value;
    setInputValue(value);

    if (props.meta.options) {
      let matchingOptions: OptionType;
      if (typeof props.meta.options[0] === "string") {
        matchingOptions = (props.meta.options as string[]).filter((option) =>
          option.toLowerCase().includes(value.toLowerCase()),
        );
      } else {
        matchingOptions = (
          props.meta.options as { label: string; value: string }[]
        ).filter((option) =>
          option.value.toLowerCase().includes(value.toLowerCase()),
        );
      }
      setFilteredOptions(matchingOptions);
      setIsAnotherDropdownOpen(matchingOptions.length > 0);
    }
  };

  const handleInputFocus = () => {
    if (startValue()) {
      return;
    }
    setIsAnotherDropdownOpen(true);
    if (props.meta.options) {
      setFilteredOptions(props.meta.options);
    }
  };

  onCleanup(() => {
    document.removeEventListener("mousemove", moveIncrement);
    document.removeEventListener("mouseup", upIncrement);
  });

  return (
    <div
      class={`
        ${props.meta.showInside ?? true ? "b:1px|solid|#ccc p:0|5|0|5" : ""}
        ${props.meta.isLabelOnTop ? "" : "max-w:50% w:50%"}
        flex rel ai:center jc:space-between r:5
      `}
      ref={setReference}
    >
      <div class={"flex ai:center flex:1"}>
        <Show when={props.meta.leftIcon || props.meta.type === "number"}>
          <Show
            fallback={<IncrementButton downIncrement={downIncrement} />}
            when={props.meta.type !== "number"}
          >
            {props.meta.leftIcon}
          </Show>
        </Show>
        <InputField
          handleChange={handleInputChange}
          meta={props.meta}
          onFocus={handleInputFocus}
          value={props.value}
        />
        <Show when={props.meta.showFilePicker}>
          <FilePickerButton
            handleChange={handleInputChange}
            value={props.value}
          />
        </Show>
      </div>
      <UnitsDropdown
        isDropdownOpen={isDropdownOpen}
        meta={props.meta}
        reference={reference}
        selectedOption={selectedUnitOption}
        selectOption={selectOption}
        setIsDropdownOpen={setIsDropdownOpen}
        toggleDropdown={toggleDropdown}
      />
      <Show when={isAnotherDropdownOpen() && filteredOptions().length > 0}>
        <SuggestionsDropdown
          isDropdownOpen={isAnotherDropdownOpen}
          options={filteredOptions()}
          reference={reference}
          selectOption={(option) => {
            if (typeof option === "string") {
              props.changeValue(option);
            } else {
              props.changeValue(option.value);
            }
            setIsAnotherDropdownOpen(false);
          }}
          setIsDropdownOpen={setIsAnotherDropdownOpen}
        />
      </Show>
    </div>
  );
};
