import { createWritableMemo } from "@solid-primitives/memo";
import { path } from "rambda";
import { type Component, Match, Switch, } from "solid-js";

import type { TextFieldOptionsField } from "../../constants/FieldType";

import { useComponentMeta, useCssDefaultEditor, useCssEditor, useCssState } from "../../CssEditorContext";
import { sizeTypes } from "../../constants/csseditor_constants";
import { CenterDiv } from "../CenterDiv";
import { Container } from "../Container";
import { LabelWrapper } from "../LabelWrapper";
import { TextFieldWithUnitContent } from "./TextFieldWithUnitContent";

// TODO: Add example values support in text field.
export const TextFieldWithSelect: Component = () => {
  const meta = useComponentMeta() as TextFieldOptionsField;
  const [cssState, setCssState] = useCssEditor();
  const [state] = useCssState();
  const [cssDefault] = useCssDefaultEditor();

  // input will automatically display value without units, if its number field.
  const selectedValue = (): string => {
    const projections = [state() || "", ...(meta.projections ?? []), meta.name];
    return path(projections, cssState) || path(projections, cssDefault) || "";
  };

  const [selectedOption, setSelectedOption] = createWritableMemo(() => determineSelectedOption());

  function determineSelectedOption(): string {
    return sizeTypes.find((unit) => selectedValue().includes(unit)) ?? meta.unitOptions?.[0] ?? "";
  }

  function changeValue(value: string) {
    if (meta.isAddToClass ?? true) {
      setCssState(state(), ...(meta.projections ?? []), { [meta.name]: value });
    }
    meta.onChangeInput?.(value);
  }

  function handleInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    if (meta.type === "number") {
      handleNumberInputChange(value);
    } else {
      changeValue(value);
    }
  }

  function handleNumberInputChange(value: string) {
    const numericValue = Number.parseFloat(value);
    if (isNaN(numericValue)) return;

    if (meta.inputProps?.min !== undefined && numericValue < meta.inputProps.min) return;
    if (meta.inputProps?.max !== undefined && numericValue > meta.inputProps.max) return;

    changeValue(meta.unitOptions ? `${numericValue}${selectedOption()}` : `${numericValue}`);
  }

  const resetValue = () => {
    changeValue(cssDefault[state() ?? ""]?.[meta.name]);
    setSelectedOption(determineSelectedOption());
  };

  return (
    <Container>
      <Switch>
        <Match when={meta.isLabelOnTop}>
          <div class={"w:full"}>
            <LabelWrapper onResetIconClick={resetValue} />
            <TextFieldWithUnitContent
              changeValue={changeValue}
              determineSelectedOption={determineSelectedOption}
              handleInputChange={handleInputChange}
              meta={meta}
              resetValue={resetValue}
              selectedValue={selectedValue}
            />
          </div>
        </Match>
        <Match when={meta.label}>
          <CenterDiv>
            <LabelWrapper onResetIconClick={resetValue} />
            <TextFieldWithUnitContent
              changeValue={changeValue}
              determineSelectedOption={determineSelectedOption}
              handleInputChange={handleInputChange}
              meta={meta}
              resetValue={resetValue}
              selectedValue={selectedValue}
            />
          </CenterDiv>
        </Match>
        <Match when={true}>
          <TextFieldWithUnitContent
            changeValue={changeValue}
            determineSelectedOption={determineSelectedOption}
            handleInputChange={handleInputChange}
            meta={meta}
            resetValue={resetValue}
            selectedValue={selectedValue}
          />
        </Match>
      </Switch>
    </Container>
  );
};
