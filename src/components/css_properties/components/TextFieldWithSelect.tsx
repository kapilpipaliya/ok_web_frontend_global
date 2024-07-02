import { Icon } from "@iconify-icon/solid";
import {
  For,
  type JSXElement,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  useContext,
} from "solid-js";

import "~/css/componentUtilCSS.css";

import { sizeTypes } from "../constants/constants";
import { CssDefaultEditorContext, CssEditorContext, CssStateContext } from "../context";
import { CenterDiv, Container, ContainerLabel } from "./CssUtils";

export const TextFieldWithSelect = (props: {
  infoLink?: string;
  inputType?: string;
  isAddToClass?: boolean;
  isLabelOnTop?: boolean;
  label?: string;
  leftIcon?: JSXElement;
  name: string;
  onChangeInput?: any;
  options?: string[];
  placeholder?: string;
  showInside?: boolean;
  value?: () => any;
}) => {
  const [cssState, setCssState] = useContext(CssEditorContext);
  const [state, setState] = useContext(CssStateContext);
  const [cssDefault, setCssDefault] = useContext(CssDefaultEditorContext);
  const selected = () => cssState[state() || '']?.[props.name] || cssDefault[state() ?? '']?.[props.name] || '';

  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  const [isMoving, setIsMoving] = createSignal(false);
  const [startY, setStartY] = createSignal(0);
  const [startValue, setStartValue] = createSignal(selected());
  

  createEffect((v) => {
    setOption(determineSelectedOption());
  });
  const determineSelectedOption = () => {
    return sizeTypes.find((unit) => selected().includes(unit)) || 'px';
  };

  const [selectedOption, setOption] = createSignal(determineSelectedOption());

  const handleChange = (event: any) => {
    const value = event.target.value;
    if(value === "") {
      setCssState(state(),{[props.name]: ""});
      return
    }
    const numericValue = Number.parseFloat(value);
    if (props.isAddToClass) {
      if(props.options) {
        setCssState(state(),{[props.name]: `${value}${selectedOption()}`});
      }else{
        setCssState(state(),{[props.name]: `${numericValue}`});
      }
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
      setCssState(state(),{[props.name]: ""});
      return;
    }
    setIsDropdownOpen(false);
    setOption(option);
    const value = getValueWithoutUnits(selected());
    setCssState(state(), {[props.name]: `${value}${option}`});
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
      setCssState(state(), {[props.name]: `${startValue() + diff}${selectedOption()}`}); // Assuming each pixel move changes the value by 1
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
      class={`${
        props.showInside ? "b:1px|solid|#ccc" : ""
      } ${props.showInside ? "p:0|5|0|5" : ""} ${
        !props.isLabelOnTop ? "max-w:50%" : ""
      } flex rel ai:center jc:space-between r:5`}
    >
      <div class={"flex ai:center"} style={{ flex: "1" }}>
        <Show when={props.leftIcon || props.inputType === "number"}>
          <Show
            fallback={
              <button
                onMouseDown={downIncrement}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "ns-resize",
                }}
              >
                <Icon icon="gg:scroll-v" style={{ color: "grey" }} />
              </button>
            }
            when={props.inputType !== "number"}
          >
            {props.leftIcon}
          </Show>
        </Show>
        <Show
          fallback={
            <label>{props.label}<input
              class={"f:14"}
              onInput={handleChange}
              placeholder={`${
                props.inputType === "number" ? "0" : props.placeholder
              }`}
              step="any"
              style={{ width: "100%" }} // Set width to 100%
              type={props.inputType || "text"}
              value={getValueWithoutUnits(selected())}
            /></label>
          }
          when={props.showInside}
        >
          <input
            class="f:14 outline:none p:5"
            onInput={handleChange}
            placeholder={`${
              props.inputType === "number" ? "0" : props.placeholder
            }`}
            step="any"
            style={{ width: "100%" }}
            type={props.inputType || "text"}
            value={getValueWithoutUnits(
              props.value ? props.value() : selected(),
            )}
          />
        </Show>
      </div>
      <Show when={props.options}>
        <span
          class={
            "color:lightgrey cursor:pointer f:14 ml:5 pr:5 user-select:none"
          }
          onClick={toggleDropdown}
        >
          {selectedOption?.()}
        </span>
        <Show when={isDropdownOpen()}>
          <div
            class={
              "abs bg:white box-shadow:0px|2px|5px|rgba(0,0,0,0.2) left:0 p:5 r:5 top:100% w:full z-index:1000"
            }
          >
            <For each={props.options}>
              {(option) => (
                <div
                  class={`${
                    selectedOption?.() === option
                      ? "bg:rgb(229,234,253) font-weight:medium"
                      : "bg:transparent"
                  } flex ai:center bg:#efefef:hover cursor:pointer jc:space-between p:5 r:5`}
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

  const isDefaultValue = createMemo(() => selected() !== cssDefault[state() ?? '']?.[props.name] && selected() !== "");

  const resetValue = () => {
    setCssState(state(), {[props.name]: cssDefault[state() ?? '']?.[props.name]});
    setStartValue(cssDefault[state() ?? '']?.[props.name]);
    setOption(determineSelectedOption());
  };
  
  return (
    <Container>
      <Show
        fallback={
          <Show fallback={<Content />} when={props.label}>
            <CenterDiv>
              <ContainerLabel info={props.name} onIconClick={resetValue}
                showIcon={isDefaultValue()} title={props.label} />
              <Content />
            </CenterDiv>
          </Show>
        }
        when={props.isLabelOnTop}
      >
        <div class={"w:full"}>
          <ContainerLabel info={props.name} onIconClick={resetValue}
            showIcon={isDefaultValue()} title={props.label} />
          <Content />
        </div>
      </Show>
    </Container>
  );
};
