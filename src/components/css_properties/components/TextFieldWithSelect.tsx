import { Icon } from "@iconify-icon/solid";
import {
  useContext,
  createSignal,
  createEffect,
  onCleanup,
  Show,
  For,
  type JSXElement,
  createMemo,
} from "solid-js";
import { TextField } from "~/components/solid_blocks";
import { CssDefaultEditorContext, CssEditorContext, sizeTypes } from "../context";
import { Container, CenterDiv, ContainerLabel } from "./CssUtils";
import "~/css/componentUtilCSS.css";

export const TextFieldWithSelect = (props: {
  name: string;
  options?: string[];
  value?: () => any;
  onChangeInput?: any;
  leftIcon?: JSXElement;
  isLabelOnTop?: boolean;
  label?: string;
  showInside?: boolean;
  inputType?: string;
  placeholder?: string;
  isAddToClass?: boolean;
}) => {
  const [cssState, setCssState] = useContext(CssEditorContext);
  const [cssDefault, setCssDefault] = useContext(CssDefaultEditorContext);
  const selected = () => cssState[props.name] || cssDefault[props.name] || '';

  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [isMoving, setIsMoving] = createSignal(false);
  const [startY, setStartY] = createSignal(0);
  const [startValue, setStartValue] = createSignal(selected());
  

  createEffect((v) => {
    setOption(determineSelectedOption());
  });
  const determineSelectedOption = () => {
    if (!selected()) return '';
    return sizeTypes.find((unit) => selected().includes(unit));
  };

  const [selectedOption, setOption] = createSignal(determineSelectedOption());

  const handleChange = (event: any) => {
    const value = event.target.value;
    if(value === "") {
      setCssState(props.name, "");
      return
    }
    const numericValue = Number.parseFloat(value);
    if (props.isAddToClass) {
      setCssState(props.name, `${numericValue}${selectedOption()}`);
    }
    if (props.onChangeInput) {
      props.onChangeInput(`${numericValue}${selectedOption()}`);
    }
  };

  const toggleDropdown = (event: any) => {
    event.stopPropagation(); // Prevent click from immediately closing the dropdown
    setIsDropdownOpen(!isDropdownOpen());
  };

  const selectOption = (option: string) => {
    if (option === "") {
      setIsDropdownOpen(false);
      setOption(option);
      setCssState(props.name, "");
      return;
    }
    setIsDropdownOpen(false);
    setOption(option);
    const value = getValueWithoutUnits(selected());
    setCssState(props.name, `${value}${option}`);
  };

  const getValueWithoutUnits = (valueWithUnits: string) => {
    if (!valueWithUnits) return "";
    const unitsToRemove = ["px", "%", "em", "rem", "vh", "vw"];
    const regexPattern = new RegExp(unitsToRemove.join("|"), "g");
    return Number.parseFloat(valueWithUnits.replace(regexPattern, ""));
  };

  // Function to normalize and set the new value based on mouse movement
  const moveIncrement = (event: any) => {
    if (isMoving()) {
      const diff = startY() - event.pageY;
      setCssState(props.name, `${startValue() + diff}${selectedOption()}`); // Assuming each pixel move changes the value by 1
    }
  };

  // Function to start the increment process
  const downIncrement = (event: any) => {
    event.preventDefault();
    setIsMoving(true);
    setStartY(event.pageY);
    setStartValue(
      getValueWithoutUnits(
        props.value ? props.value() : selected(),
      ),
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
  const Content = () => (
    <div
      class={`flex ai:center jc:space-between ${
        props.showInside ? "b:1px|solid|#ccc" : ""
      } r:5 ${props.showInside ? "p:0|5|0|5" : ""} rel ${
        !props.isLabelOnTop ? "max-w:50%" : ""
      }`}
    >
      <div class={"flex ai:center"} style={{ flex: "1" }}>
        <Show when={props.leftIcon || props.inputType === "number"}>
          <Show
            when={props.inputType !== "number"}
            fallback={
              <button
                onMouseDown={downIncrement}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "ns-resize",
                }}
              >
                <Icon icon="gg:scroll-v" style={{ color: "grey" }} />
              </button>
            }
          >
            {props.leftIcon}
          </Show>
        </Show>
        <Show
          when={props.showInside}
          fallback={
            <TextField
              step="any"
              label={props.label}
              type={props.inputType || "text"}
              placeholder={`${
                props.inputType === "number" ? "0" : props.placeholder
              }`}
              value={getValueWithoutUnits(selected())}
              onInput={handleChange}
              class={"f:14"}
              style={{ width: "100%" }} // Set width to 100%
            />
          }
        >
          <input
            step="any"
            type={props.inputType || "text"}
            placeholder={`${
              props.inputType === "number" ? "0" : props.placeholder
            }`}
            value={getValueWithoutUnits(
              props.value ? props.value() : selected(),
            )}
            class="f:14 outline:none p:5"
            onInput={handleChange}
            style={{ width: "100%" }}
          />
        </Show>
      </div>
      <Show when={props.options}>
        <span
          onClick={toggleDropdown}
          class={
            "color:lightgrey f:14 ml:5 pr:5 cursor:pointer user-select:none"
          }
        >
          {selectedOption?.()}
        </span>
        <Show when={isDropdownOpen()}>
          <div
            class={
              "bg:white w:full box-shadow:0px|2px|5px|rgba(0,0,0,0.2) r:5 p:5 abs z-index:1000 top:100% left:0"
            }
          >
            <For each={props.options}>
              {(option) => (
                <div
                  onClick={() => selectOption(option)}
                  class={`flex ai:center jc:space-between p:5 cursor:pointer bg:#efefef:hover ${
                    selectedOption?.() === option
                      ? "bg:rgb(229,234,253) font-weight:medium"
                      : "bg:transparent"
                  } r:5`}
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

  const isDefaultValue = createMemo(() => selected() !== cssDefault[props.name] && selected() !== "");

  const resetValue = () => {
    setCssState(props.name, cssDefault[props.name]);
    setStartValue(cssDefault[props.name]);
    setOption(determineSelectedOption());
  };
  
  return (
    <Container>
      <Show
        when={props.isLabelOnTop}
        fallback={
          <Show when={props.label} fallback={<Content />}>
            <CenterDiv>
              <ContainerLabel onIconClick={resetValue}
                showIcon={isDefaultValue()} title={props.label} />
              <Content />
            </CenterDiv>
          </Show>
        }
      >
        <div class={"w:full"}>
          <ContainerLabel onIconClick={resetValue}
            showIcon={isDefaultValue()} title={props.label} />
          <Content />
        </div>
      </Show>
    </Container>
  );
};
