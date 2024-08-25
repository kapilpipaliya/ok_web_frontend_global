import { createWritableMemo } from "@solid-primitives/memo";
import { splitProps } from "solid-js";

import type { TextFieldOptionsField } from "../../constants/FieldSchemaType";

import { sizeTypes } from "../../constants/csseditor_constants";
import { TextFieldWithUnitContent } from "./TextFieldWithUnitContent";

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
  const [local, _others] = splitProps(props, ["componentName", "onChange"]);

  function changeValue(value?: string) {
    local.onChange?.(value);
  }

  function handleInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    if (props.type === "number") {
      handleNumberInputChange(value);
    } else {
      changeValue(value);
    }
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

  return (
    <TextFieldWithUnitContent
      changeValue={changeValue}
      determineSelectedOption={determineSelectedOption}
      handleInputChange={handleInputChange}
      meta={props}
      value={props.value}
    />
  );
};
