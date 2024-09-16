import { createWritableMemo } from "@solid-primitives/memo";
import { type Component, createSignal, JSX, onCleanup, Show, splitProps } from "solid-js";

import type { OptionType, TextFieldOptionsField } from "~/components/css_properties/constants/FieldSchemaType";

import { FilePickerButton } from "./FilePickerButton";
import { getValueWithoutUnits } from "../../../../../lib/data_structure/number/getValueWithoutUnits";
import { IncrementButton } from "./IncrementButton";
import { InputField } from "./InputField";
import { SuggestionsDropdown } from "./SuggestionsDropdown";
import { UnitsDropdown } from "./UnitsDropdown";
import { sizeTypes } from "~/components/css_properties/constants/csseditor_constants";

export const TextFieldWithSelect = (props: Readonly<TextFieldOptionsField>) => {
    // input will automatically display value without units, if its number field.

    const [selectedOption, _setSelectedOption] = createWritableMemo(() =>
      determineSelectedOption(),
    );
  
    function determineSelectedOption(): string {
      return (
        sizeTypes.find((unit) => props.value?.includes(unit)) ??
        props.unitOptions?.[0] ??
        ""
      );
    }
    const [local, others] = splitProps(props, ["componentName", "onChange", "containerClass", "showFilePicker"]);
  
    function changeValue(value?: string) {
      local.onChange?.(value);
    }
  
    function handleNumberInputChange(value: string) {
      const numericValue = Number.parseFloat(value);
      if (Number.isNaN(numericValue)) {
        return;
      }
  
      if (
        props.inputProps?.min !== undefined &&
        numericValue < props.inputProps.min
      ) {
        return;
      }
      if (
        props.inputProps?.max !== undefined &&
        numericValue > props.inputProps.max
      ) {
        return;
      }
  
      changeValue(
        props.unitOptions
          ? `${numericValue}${selectedOption()}`
          : `${numericValue}`,
      );
    }


  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [isMoving, setIsMoving] = createSignal(false);
  const [startY, setStartY] = createSignal(0);
  const [startValue, setStartValue] = createWritableMemo<number | string>(
    () => props.value,
  );
  const [selectedUnitOption, setSelectedUnitOption] = createSignal(
    determineSelectedOption(),
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
    changeValue(`${value}${option}`);
  };

  const moveIncrement = (event: MouseEvent) => {
    if (isMoving()) {
      const diff = startY() - event.pageY;
      let newValue =
        Number(getValueWithoutUnits(startValue() as string)) + diff;
      newValue = clampValue(newValue);
      changeValue(`${newValue}${selectedUnitOption()}`);
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
    if (props.inputProps?.min !== undefined) {
      value = Math.max(value, props.inputProps.min);
    }
    if (props.inputProps?.max !== undefined) {
      value = Math.min(value, props.inputProps.max);
    }
    return value;
  }

  const handleInputChange = (event: Event) => {
 
    const target = event.target as HTMLInputElement;
    const value = target.value;

    if (props.type === "number") {
      handleNumberInputChange(value);
    } else {
      changeValue(value);
    }

    setInputValue(value);

    if (props.options) {
      let matchingOptions: OptionType;
      if (typeof props.options[0] === "string") {
        matchingOptions = (props.options as string[]).filter((option) =>
          option.toLowerCase().includes(value.toLowerCase()),
        );
      } else {
        matchingOptions = (
          props.options as { label: string; value: string }[]
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
    if (props.options) {
      setFilteredOptions(props.options);
    }
  };

  onCleanup(() => {
    document.removeEventListener("mousemove", moveIncrement);
    document.removeEventListener("mouseup", upIncrement);
  });

  return (
    // <div
    //   class={`
    //     ${props.showInside ?? true ? "b:1px|solid|#ccc p:0|5|0|5" : ""}
    //     ${props.isLabelOnTop ? "" : "max-w:50% w:50%"}
    //     flex rel ai:center jc:space-between r:5
    //   `}
    // >
    <>
      <div class={`${local.containerClass} flex ai:center`} ref={setReference}>
        <Show when={props.leftIcon || props.type === "number"}>
          <Show
            fallback={<IncrementButton downIncrement={downIncrement} />}
            when={props.type !== "number"}
          >
            {props.leftIcon}
          </Show>
        </Show>
        <InputField
          handleChange={handleInputChange}
          onFocus={handleInputFocus}
          value={props.value}
          showInside={props.showInside}
          inputProps={props.inputProps}
          type={props.type}
          placeholder={props.placeholder}
          label={props.label}
        />
        <Show when={props.showFilePicker}>
          <FilePickerButton
            handleChange={handleInputChange}
            value={props.value}
          />
        </Show>
      </div>
      <UnitsDropdown
        unitOptions={props.options as unknown as string[]}
        isDropdownOpen={isDropdownOpen}
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
              changeValue(option);
            } else {
              changeValue(option.value);
            }
            setIsAnotherDropdownOpen(false);
          }}
          setIsDropdownOpen={setIsAnotherDropdownOpen}
        />
      </Show>
    </>
  );
};
