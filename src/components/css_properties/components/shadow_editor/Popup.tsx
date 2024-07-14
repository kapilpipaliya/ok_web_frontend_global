import { Icon } from "@iconify-icon/solid";
import { Accessor, For, Setter, Show } from "solid-js";

import { DynamicCSSComponent } from "~/components/css_properties/components/DynamicCssComponent";
import { useCssEditor, useCssState } from "../../context";

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

export interface PopupProps {
  children: any;
  dialogLabel: string;
  index: number;
  openMenu: [Accessor<null | number>, Setter<null | number>];
  option: string;
}

export function Popup(props: Readonly<PopupProps>) {
  const [cssState, setCssState] = useCssEditor();
  const [state] = useCssState();

  const setCssStateFromProperties = (property: {
    children?: any[];
    name: keyof CssProperties;
  }) => {
    const data = getCssParts(props.option);

    if (property.name === "grid" && property.children) {
      property.children.forEach((child) => setCssStateFromProperties(child));
      return;
    }

    // @ts-expect-error ignore
    if (data.hasOwnProperty(property.name)) {
      setCssState(state(), { [property.name]: data[property.name] });
    }
  };

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
    setCssState(state(), {
      [props.name]: `${xOffset}|${yOffset}|${blur}|${spread}|${color}|${type}`,
    });
  }

  const addOnChangeToProperties = (properties: any) => {
    // Ensure properties is an object and not null
    if (!properties || typeof properties !== "object") {
      return properties;
    }

    // If properties.children is an array, iterate over it and enhance each child
    if (Array.isArray(properties.children)) {
      properties.children = properties.children.map((child) => addOnChangeToProperties(child)
      );
    }
    // const [changedData, setChangedData] = createSignal<Record<string, string>>(
    //   {},
    // );
    // const getValueOfInput = (name: string) => changedData()[name];

    // Add onChangeInput handler to the properties object
    return {
      ...properties,
      isAddToClass: false,
      onChangeInput: (value: string) => {
        //setChangedData({ ...changedData(), [properties.name]: value });
        //createCssOption(changedData());
        setCssState(state(), { [properties.name]: value });
      },
      value: () => getValueOfInput(properties.name),
    };
  };

  return (
    <Show when={props.openMenu[0]() === props.index}>
      <div
        class={"popup b:1px|solid|#ccc bg:#fff mr:100px p:10px position:absolute r:10px w:280px z:4"}
      >
        <div class={"flex ai:center jc:space-between mb:5"}>
          <div class={"f:15 font-weight:bold"}>{props.dialogLabel}</div>
          <Icon class={"fg:grey"} icon={"mdi:close"} onClick={() => props.openMenu[1](null)} />
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
        class={`${props.openMenu[0]() ? "display:block" : "display:none"} h:100% left:0 position:fixed top:0 w:100% z:3`}
        onClick={() => props.openMenu[1](null)} />
    </Show>
  );
}
