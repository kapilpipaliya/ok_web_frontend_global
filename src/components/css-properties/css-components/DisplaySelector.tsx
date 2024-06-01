import { Icon } from "@iconify-icon/solid";
import { useContext, createSignal, createEffect, onCleanup, Show, For } from "solid-js";
import { CssEditorContext } from "../cssContext";
import { Container, ContainerLabel } from "./CssUtils";
import "~/css/componentUtilCSS.css";

export const DisplaySelector = (props: {
    name: string;
    options: any;
    isLabelOnTop: boolean;
    label: string;
    onChangeInput?: (label:any,value: any) => void;
}) => {
    function formatString(str: string) {
        return str
            .split("-") // Split the string by hyphen
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each part
            .join(" "); // Join the parts with a space
    }

    const [cssState, setCssState] = useContext(CssEditorContext);
    const [isActive, setIsActive] = createSignal(false);
    const toggleDropdown = () => setIsActive(!isActive());
    const selected = () =>
        cssState[props.name] || props.options[0].value || props.options[0];

    const selectOption = (option: any) => {
        setCssState(props.name, option.value || option);
        if(props.onChangeInput) props.onChangeInput(props.name,option.value || option);
        setIsActive(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
        const dropdown = document.getElementById(`select-dropdown${props.label}`);
        if (dropdown && !dropdown.contains(event.target as Node)) {
            setIsActive(false);
        }
    };

    createEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        onCleanup(() =>
            document.removeEventListener("mousedown", handleClickOutside),
        );
    });

    return (
        <Container>
            <Show
                when={props.isLabelOnTop}
                fallback={
                    <Show when={props.label} fallback={<Content />}>
                        <div class={"w:100% flex jc:space-between ai:center"}>
                            <ContainerLabel title={props.label} />
                            <Content />
                        </div>
                    </Show>
                }
            >
                <div class={"w:full"}>
                    <ContainerLabel title={props.label} />
                    <Content />
                </div>
            </Show>
        </Container>
    );

    function Content() {
        return (
            <div class={`rel ${props.isLabelOnTop ? "w:full" : "w:50%"}`}>
                <div
                    class={`flex ai:center jc:space-between b:1px|solid|lightgray r:5 p:2|7 f:14 ${isActive() ? "open" : ""}`}
                    onClick={toggleDropdown}
                >
                    <button
                        class="select-button"
                        role="combobox"
                        aria-labelledby="select button"
                        aria-haspopup="listbox"
                        aria-controls={`select-dropdown${props.label}`}
                        aria-expanded={isActive()}
                    >
                        <span class="selected-value">{formatString(selected())}</span>
                        <span class="arrow" />
                    </button>
                    <div>
                        <Icon
                            icon={"teenyicons:down-small-outline"}
                            height={22}
                            width={22}
                        />
                    </div>
                </div>

                <ul
                    class={`popup b:1px|solid|lightgray bg:white mt:2 p:4|10 r:5 w:-webkit-fill-available ${isActive() ? "visible" : "hidden"}`}
                    style={
                        "max-height: 15rem;overflow: auto;scrollbar-width:thin;cursor: auto;position: absolute;outline: 0;top: 100%;text-shadow: none;text-align: left;box-shadow: -1px 0px 14px 3px rgba(17,36,38,.15);border: 1px solid rgba(34,36,38,.15);border-radius: .28571429rem;transition: opacity .1s ease;z-index: 11;will-change: transform,opacity;"
                    }
                    id={`select-dropdown${props.label}`}
                >
                    <For each={props.options}>
                        {(option) => {
                            const label = () => option.value || option;
                            return (
                                <li
                                    class={`rel f:14 flex ai:center jc:space-between p:5 cursor:pointer ${selected() !== label() ? "bg:#efefef:hover" : "bg:rgb(229,234,253):hover"} font-weight:${selected() === label() ? "medium" : ""} r:5 ${selected() === label() ? "bg:rgb(229,234,253)" : ""}`}
                                    onClick={() => selectOption(option)}
                                >
                                    <label>{formatString(label())}</label>
                                    <Show when={selected() === label()}>
                                        <Icon
                                            icon={"icon-park-outline:check-one"}
                                            height={22}
                                            width={22}
                                            style={{ color: "dodgerblue" }}
                                        />
                                    </Show>
                                </li>
                            );
                        }}
                    </For>
                </ul>
            </div>
        );
    }
};