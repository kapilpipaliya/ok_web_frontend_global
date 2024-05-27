import { createSignal, useContext, Show, For } from "solid-js";
import { DynamicCSSComponent } from "~/components/dynamic/components/DynamicCssComponent";
import { CssEditorContext } from "../cssContext";
import { ButtonGroups } from "./ButtonGroups";

export const FieldWithCustomBox = (props: {
    label: string;
    name: string;
    component: string;
    isLabelOnTop: boolean;
    options: any;
    customProperty: any;
    gridType?: string;
    mainFieldType?: string;
    inputType?: string;
}) => {
    const [optionType, setOptionType] = createSignal("all");
    const [cssState, setCssState] = useContext(CssEditorContext);

    const onChangeAllField = () => {
        let newState = { ...cssState };
        props.customProperty.forEach((property: any) => {
            newState[property.name] = cssState[props.name];
        });
        setCssState(newState);
    };

    return (
        <div>
            <div
                style={{
                    display: "grid",
                    gap: "10px",
                    "align-items": "end",
                    "grid-template-columns": "1fr 20%",
                }}
            >
                <DynamicCSSComponent
                    value={{
                        name: props.name,
                        placeholder: "0",
                        isLabelOnTop: props.isLabelOnTop,
                        label: props.label,
                        type: props.inputType ?? "number",
                        onChangeInput: () => {
                            onChangeAllField();
                        },
                        component: props.mainFieldType ?? "textFieldOptions",
                        options: props.options,
                    }}
                />
                <ButtonGroups
                    isLabelOnTop={false}
                    name={props.name}
                    isAddToClass={false}
                    label={false}
                    onChangeInput={() => {
                        if (optionType() === "all") {
                            setOptionType("custom");
                        } else {
                            setOptionType("all");
                        }
                    }}
                    options={[
                        {
                            key: "allCustom",
                            value: "all",
                            tooltip: "All",
                            icon: true,
                        },
                        {
                            key: "customIcon",
                            value: "custom",
                            tooltip: "Custom",
                            icon: true,
                        },
                    ]}
                />
            </div>
            <Show when={optionType() === "custom"}>
                <div
                    class={"b:1px|solid|lightgray p:0|10 pb:7 r:5 m:5|10"}
                    style={{
                        display: "grid",
                        gap: "10px",
                        "align-items": "end",
                        "grid-template-columns": props.gridType ?? "repeat(2,auto)",
                    }}
                >
                    <For each={props.customProperty}>
                        {(item) => {
                            return (
                                <DynamicCSSComponent
                                    value={{
                                        name: item.name,
                                        isLabelOnTop: props.isLabelOnTop,
                                        placeholder: "0",
                                        label: item.label,
                                        type: props.inputType ?? "number",
                                        component: props.mainFieldType ?? "textFieldOptions",
                                        options: props.options,
                                    }}
                                />
                            );
                        }}
                    </For>
                </div>
            </Show>
        </div>
    );
};