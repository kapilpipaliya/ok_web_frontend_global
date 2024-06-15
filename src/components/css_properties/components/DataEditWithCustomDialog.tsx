import { Icon } from "@iconify-icon/solid";
import {
  type Accessor,
  type JSXElement,
  type Setter,
  useContext,
  createSignal,
  Show,
  For,
  Switch,
  Match,
  createMemo, type JSX,
} from "solid-js";
import { DynamicCSSComponent } from "~/components/css_properties/components/DynamicCssComponent";
import { CssDefaultEditorContext, CssEditorContext, CssStateContext } from "../context";
import { ContainerLabel } from "./CssUtils";
import "~/css/componentUtilCSS.css";

export const DataEditWithCustomDialog = (props: {
  label: any;
  name: string;
  openMenu: Accessor<any>;
  setOpenMenu: Setter<any>;
  centerComponent?: JSXElement;
  dialogLabel: any;
  children: JSX.Element;
  fallback?: any;
}) => {
  const [cssState, setCssState] = useContext(CssEditorContext);
  const [state, setState] = useContext(CssStateContext);
  const [cssDefault, setCssDefault] = useContext(CssDefaultEditorContext);
  const [changedData, setChangedData] = createSignal<any>({});

  const selected = () => cssState[state() || '']?.[props.name] || cssDefault[state() ?? '']?.[props.name] || '';

  interface CssProperties {
    "x-offset": string;
    "y-offset": string;
    blur: string;
    spread: string;
    color: string;
    type: string;
  }

  // Function to parse CSS parts
  function getCssParts(option: string): CssProperties {
    const parts = option.split("|");
    return {
      "x-offset": parts[0] || "",
      "y-offset": parts[1] || "",
      blur: parts[2] || "",
      spread: parts[3] || "",
      color: parts[4] || "",
      type: parts[5] || "",
    };
  }

  function createCssOption(css: CssProperties) {
    // Deconstruct the cssProperties object to extract each property
    const {
      "x-offset": xOffset = "0",
      "y-offset": yOffset = "0",
      blur = "0",
      spread = "0",
      color = "#000",
      type = "",
    } = css;
    setCssState(state(),
      {[props.name]:
      `${xOffset}|${yOffset}|${blur}|${spread}|${color}|${type}`,}
    );
  }

  const addOption = () => {
    if (props.label.includes("Text Shadow")) {
      const currentOptions = selected()
        ? selected().split(",")
        : [];
      currentOptions.push("0|0|5|0|#000|inset");
      const newValue = currentOptions.join(",");
      setCssState(state(),{[props.name]: newValue});
    } else if (props.label.includes("Filter")) {
      const currentOptions = selected()
        ? selected().split("|")
        : [];
      currentOptions.push("blur(3px)");
      const newValue = currentOptions.join("|");
      setCssState(state(),{[props.name]: newValue});
    } else if (props.label.includes("Box Shadow")) {
      const currentOptions = selected()
        ? selected().split(",")
        : [];
      currentOptions.push("0|0|5|0|#000|inset");
      const newValue = currentOptions.join(",");
      setCssState(state(),{[props.name]: newValue});
    } else if (props.label.includes("Transition")) {
      const currentOptions = selected()
        ? selected().split(",")
        : [];
      currentOptions.push("opacity|1s|ease|0s");
      const newValue = currentOptions.join(",");
      setCssState(state(),{[props.name]: newValue});
    } else if (props.label.includes("Transform")) {
      const currentOptions = selected()
        ? selected().split("|")
        : [];
      currentOptions.push("rotate(10deg)");
      const newValue = currentOptions.join("|");
      setCssState(state(),{[props.name]: newValue});
    }
  };

  const getOptions = () => {
    if (props.label.includes("Shadow") || props.label.includes("Transition")) {
      return (selected() && selected().split(",")) || [];
    }
    if (props.label.includes("Filter")) {
      return (selected() && selected().split("|")) || [];
    }
    if (props.label.includes("Transform")) {
      return (selected() && selected().split("|")) || [];
    }
    return [];
  };
  const isDefaultValue = createMemo(() => selected() !== cssDefault[state() ?? '']?.[props.name] && selected() !== '');

  const getValueOfInput = (name: string) => changedData()[name];
  const deleteOption = (index: number) => {
    if (props.label.includes("Shadow") || props.label.includes("Transition")) {
      const data = selected()
        .split(",")
        .filter((_: any, i: any) => i !== index);
      setCssState(state(),{[ props.name]: data.join(",")});
    } else if (props.label.includes("Filter")) {
      const data = selected()
        .split("|")
        .filter((_: any, i: any) => i !== index);
      setCssState(state(),{[ props.name]: data.join("|")});
    } else if (props.label.includes("Transform")) {
      const data = selected()
        .split("|")
        .filter((_: any, i: any) => i !== index);
      setCssState(state(),{[ props.name]: data.join("|")});
    }
  };

  const openPopup = (index: number) => {
    props.setOpenMenu(index);
  };

  const closePopup = () => {
    props.setOpenMenu(null);
  };
  const renderPopup = (option: any, index: number) => {
    const setCssStateFromProperties = (property: {
      name: keyof CssProperties;
      children?: any[];
    }) => {
      const data = getCssParts(option);

      if (property.name === "grid" && property.children) {
        property.children.forEach((child: any) =>
          setCssStateFromProperties(child),
        );
        return;
      }

      if (data.hasOwnProperty(property.name)) {
        setCssState(state(), {[property.name]: data[property.name]});
      }
    };

    const addOnChangeToProperties = (properties: any) => {
      // Ensure properties is an object and not null
      if (!properties || typeof properties !== "object") {
        return properties;
      }

      // If properties.children is an array, iterate over it and enhance each child
      if (Array.isArray(properties.children)) {
        properties.children = properties.children.map((child: any) =>
          addOnChangeToProperties(child),
        );
      }

      // Add onChangeInput handler to the properties object
      return {
        ...properties,
        isAddToClass: false,
        value: () => getValueOfInput(properties.name),
        onChangeInput: (value: any) => {
          setChangedData({ ...changedData(), [properties.name]: value });
          createCssOption(changedData());
          setCssState(state(), {[properties.name]: value});
        },
      };
    };

    return (
      <Show when={props.openMenu() === index} >
        <div
          style={{
            position: "absolute",
            width: "280px",
            "border-radius": "10px",
            "background-color": "#fff",
            border: "1px solid #ccc",
            padding: "10px",
            "margin-right": "100px",
            "z-index": 1000,
          }}
          class={"popup"}
        >
          <div class={"flex ai:center jc:space-between mb:5"}>
            <div class={"f:15 font-weight:bold"}>{props.dialogLabel}</div>
            <Icon
              onClick={closePopup}
              icon={"mdi:close"}
              style={{ color: "grey" }}
            />
          </div>
          <For each={Object.entries(props.children)}>
            {([sectionName, properties], index) => {
              setCssStateFromProperties(properties);
              const enhancedProperties = addOnChangeToProperties(properties);

              return <DynamicCSSComponent value={enhancedProperties} />;
            }}
          </For>
        </div>
        <div
          style={`
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
          display: ${props.openMenu() ? "block" : "none"};
        `}
          onClick={closePopup}
        />
      </Show>
    );
  };
  const resetValues = () => {
    setCssState(state(), {[props.name]: cssDefault[state() ?? '']?.[props.name]});
    setChangedData({});
  };
  const Component = (p: { option: any; i: any }) => {
    return (
      <Switch>
        <Match when={props.label.includes("Shadow")}>
          <span
            class={"f:14"}
            onClick={(e) => {
              openPopup(p.i());
            }}
            style={{
              flex: "1",
              "margin-right": "8px",
            }}
          >
            {p.option.replaceAll("|", " ")}
          </span>
          <div
            class={`mr:10 h:20px bg:#fff w:20px r:5 box-shadow:${p.option}`}
          />
        </Match>
        {props.label}
        <Match when={props.label.includes("Filter")}>
          <span
            class={"f:14"}
            onClick={(e) => {
              openPopup(p.i());
            }}
            style={{
              flex: "1",
              "margin-right": "8px",
            }}
          >
            {p.option.replaceAll(")", "").replaceAll("(", " ")}
          </span>
        </Match>
        <Match when={props.label.includes("Transition")}>
          <span
            class={"f:14"}
            onClick={(e) => {
              openPopup(p.i());
            }}
            style={{
              flex: "1",
              "margin-right": "8px",
            }}
          >
            {p.option.replaceAll("|", " ")}
          </span>
        </Match>
        <Match when={props.label.includes("Transform")}>
          <span
            class={"f:14"}
            onClick={(e) => {
              openPopup(p.i());
            }}
            style={{
              flex: "1",
              "margin-right": "8px",
            }}
          >
            {p.option.replaceAll(")", "").replaceAll("(", " ")}
          </span>
        </Match>
        <Match when={true}>{props.centerComponent}</Match>
      </Switch>
    );
  };

  return (
    <div
      class={"b:1px|solid|lightgray r:5 p:.2rem|.3rem"}
      style={{
        position: "relative",
        color: "#333",
        margin: "10px",
        width: "-webkit-fill-available",
      }}
    >
      <div
        class={`${
          getOptions().length > 0 ? "bb:1|solid|lightgrey m:1 pb:5" : ""
        }`}
        style={{
          display: "flex",
          "justify-content": "space-between",
          "align-items": "center",
          "margin-bottom": "6px",
        }}
      >
        <ContainerLabel title={props.label} onIconClick={resetValues} showIcon={isDefaultValue()} />
        <Icon
          class={"cursor:pointer"}
          onClick={addOption}
          icon={"lets-icons:add-round"}
        />
      </div>
      <For each={getOptions()}>
        {(option, i) => (
          <div
          id={`option${i()}`}
            style={{
              display: "flex",
              "align-items": "center",
              cursor: "pointer",
              "margin-bottom": "3px",
              border: "1px solid #ccc",
              padding: "5px",
              "border-radius": "4px",
            }}
          >
            <Icon
              class={"cursor:pointer mr:8"}
              onClick={() => openPopup(i())}
              icon={"icon-park-outline:more-one"}
            />
            <Component option={option} i={i} />
            <Icon
              class={"cursor:pointer mr:8"}
              onClick={() => deleteOption(i())}
              icon={"mdi:close"}
              style={{ color: "red" }}
            />
            {renderPopup(option, i())}
          </div>
        )}
      </For>
    </div>
  );
};
