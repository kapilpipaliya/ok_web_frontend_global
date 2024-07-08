import { Icon } from "@iconify-icon/solid";
import {
  type Accessor,
  For,
  Match,
  Show,
  Switch,
  createMemo,
  createSignal, 
} from "solid-js";

import { DynamicCSSComponent } from "~/components/css_properties/components/DynamicCssComponent";

import type { DataEditorField } from "../constants/FieldType";

import { useCssDefaultEditor, useCssEditor, useCssState } from "../context";
import { ContainerLabel } from "./ContainerLabel";

export const DataEditWithCustomDialog = (props: Omit<DataEditorField, 'component'>) => {
  const [cssState, setCssState] = useCssEditor();
  const [state] = useCssState();
  const [cssDefault] = useCssDefaultEditor();
  const [changedData, setChangedData] = createSignal<Record<string, string>>({});

  const selected = () => cssState[state() || '']?.[props.name] || cssDefault[state() ?? '']?.[props.name] || '';

  interface CssProperties {
    blur: string;
    color: string;
    spread: string;
    type: string;
    "x-offset": string;
    "y-offset": string;
  }

  // Function to parse CSS parts
  function getCssParts(option: string): CssProperties {
    const parts = option.split("|");
    return {
      blur: parts[2] || "",
      color: parts[4] || "",
      spread: parts[3] || "",
      type: parts[5] || "",
      "x-offset": parts[0] || "",
      "y-offset": parts[1] || "",
    };
  }

  function createCssOption(css: CssProperties) {
    // Deconstruct the cssProperties object to extract each property
    const {
      blur = "0",
      color = "#000",
      spread = "0",
      type = "",
      "x-offset": xOffset = "0",
      "y-offset": yOffset = "0",
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
        .filter((_, i) => i !== index);
      setCssState(state(),{[ props.name]: data.join(",")});
    } else if (props.label.includes("Filter")) {
      const data = selected()
        .split("|")
        .filter((_, i) => i !== index);
      setCssState(state(),{[ props.name]: data.join("|")});
    } else if (props.label.includes("Transform")) {
      const data = selected()
        .split("|")
        .filter((_, i) => i !== index);
      setCssState(state(),{[ props.name]: data.join("|")});
    }
  };

  const openPopup = (index: number) => {
    props.setOpenMenu(index);
  };

  const closePopup = () => {
    props.setOpenMenu(null);
  };
  const renderPopup = (option: string, index: number) => {
    const setCssStateFromProperties = (property: {
      children?: any[];
      name: keyof CssProperties;
    }) => {
      const data = getCssParts(option);

      if (property.name === "grid" && property.children) {
        property.children.forEach((child) =>
          setCssStateFromProperties(child),
        );
        return;
      }

      // @ts-expect-error ignore
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
        properties.children = properties.children.map((child) =>
          addOnChangeToProperties(child),
        );
      }

      // Add onChangeInput handler to the properties object
      return {
        ...properties,
        isAddToClass: false,
        onChangeInput: (value: string) => {
          setChangedData({ ...changedData(), [properties.name]: value });
          createCssOption(changedData());
          setCssState(state(), {[properties.name]: value});
        },
        value: () => getValueOfInput(properties.name),
      };
    };

    return (
      <Show when={props.openMenu() === index} >
        <div
          class={"popup"}
          style={{
            "background-color": "#fff",
            border: "1px solid #ccc",
            "border-radius": "10px",
            "margin-right": "100px",
            padding: "10px",
            position: "absolute",
            width: "280px",
            "z-index": 4,
          }}
        >
          <div class={"flex ai:center jc:space-between mb:5"}>
            <div class={"f:15 font-weight:bold"}>{props.dialogLabel}</div>
            <Icon
              icon={"mdi:close"}
              onClick={closePopup}
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
        {/* TODO Remove this div */}
        <div
          onClick={closePopup}
          style={`
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 3;
          display: ${props.openMenu() ? "block" : "none"};
        `}
        />
      </Show>
    );
  };
  const resetValues = () => {
    setCssState(state(), {[props.name]: cssDefault[state() ?? '']?.[props.name]});
    setChangedData({});
  };
  const Component = (p: { i: Accessor<number>; option: string }) => {
    return (
      <Switch>
        <Match when={props.label.includes("Shadow")}>
          <span
            class={"f:14"}
            onClick={() => {
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
            class={`bg:#fff box-shadow:${p.option} h:20px mr:10 r:5 w:20px`}
          />
        </Match>
        {props.label}
        <Match when={props.label.includes("Filter")}>
          <span
            class={"f:14"}
            onClick={() => {
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
            onClick={() => {
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
            onClick={() => {
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
      class={"b:1px|solid|lightgray p:.2rem|.3rem r:5"}
      style={{
        color: "#333",
        margin: "10px",
        position: "relative",
        width: "-webkit-fill-available",
      }}
    >
      <div
        class={`${
          getOptions().length > 0 ? "bb:1|solid|lightgrey m:1 pb:5" : ""
        }`}
        style={{
          "align-items": "center",
          display: "flex",
          "justify-content": "space-between",
          "margin-bottom": "6px",
        }}
      >
        <ContainerLabel info={props.name} onIconClick={resetValues} showIcon={isDefaultValue()} title={props.label} />
        <Icon
          class={"cursor:pointer"}
          icon={"lets-icons:add-round"}
          onClick={addOption}
        />
      </div>
      <For each={getOptions()}>
        {(option, i) => (
          <div
            style={{
              "align-items": "center",
              border: "1px solid #ccc",
              "border-radius": "4px",
              cursor: "pointer",
              display: "flex",
              "margin-bottom": "3px",
              padding: "5px",
            }}
          >
            <Icon
              class={"cursor:pointer mr:8"}
              icon={"icon-park-outline:more-one"}
              onClick={() => openPopup(i())}
            />
            <Component i={i} option={option} />
            <Icon
              class={"cursor:pointer mr:8"}
              icon={"mdi:close"}
              onClick={() => deleteOption(i())}
              style={{ color: "red" }}
            />
            {renderPopup(option, i())}
          </div>
        )}
      </For>
    </div>
  );
};
