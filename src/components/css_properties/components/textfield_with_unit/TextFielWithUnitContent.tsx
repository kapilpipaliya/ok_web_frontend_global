import { type Component, Show, createSignal, onCleanup } from "solid-js";

import { Dropdown } from "./Dropdown";
import { IncrementButton } from "./IncrementButton";
import { InputField } from "./InputField";
import { getValueWithoutUnits } from "./getValueWithoutUnits";

interface ContentProps {
  changeValue: (value: string) => void;
  determineSelectedOption: () => string;
  handleInputChange: (event: Event) => void;
  meta: any; // Define the proper type here
  resetValue: () => void;
  selectedValue: () => string;
}

export const TextFielWithUnitContent: Component<ContentProps> = (props) => {
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [isMoving, setIsMoving] = createSignal(false);
  const [startY, setStartY] = createSignal(0);
  const [startValue, setStartValue] = createSignal<number | string>(props.selectedValue());
  const [selectedOption, setSelectedOption] = createSignal(props.determineSelectedOption());
  const [reference, setReference] = createSignal<HTMLElement | null>(null);

  const toggleDropdown = (event: MouseEvent) => {
    event.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen());
  };

  const selectOption = (option: string) => {
    setIsDropdownOpen(false);
    setSelectedOption(option);
    const value = getValueWithoutUnits(props.selectedValue());
    props.changeValue(`${value}${option}`);
  };

  const moveIncrement = (event: MouseEvent) => {
    if (isMoving()) {
      const diff = startY() - event.pageY;
      let newValue = Number(startValue()) + diff;
      newValue = clampValue(newValue);
      props.changeValue(`${newValue}${selectedOption()}`);
    }
  };

  const downIncrement = (event: MouseEvent) => {
    event.preventDefault();
    setIsMoving(true);
    setStartY(event.pageY);
    setStartValue(getValueWithoutUnits(props.selectedValue()));
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

  onCleanup(() => {
    document.removeEventListener("mousemove", moveIncrement);
    document.removeEventListener("mouseup", upIncrement);
  });

  return (
    <div
      class={`${props.meta.showInside ? "b:1px|solid|#ccc" : ""} ${props.meta.showInside ? "p:0|5|0|5" : ""} ${!props.meta.isLabelOnTop ? "max-w:50%" : ""} flex rel ai:center jc:space-between r:5`}
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
        <InputField handleChange={props.handleInputChange} meta={props.meta} selectedValue={props.selectedValue} />
      </div>
      <Dropdown
        isDropdownOpen={isDropdownOpen}
        meta={props.meta}
        reference={reference}
        selectOption={selectOption}
        selectedOption={selectedOption}
        setIsDropdownOpen={setIsDropdownOpen}
        toggleDropdown={toggleDropdown}
      />
    </div>
  );
};
