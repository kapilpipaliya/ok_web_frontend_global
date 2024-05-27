import { Show, useContext } from "solid-js";
import { CssEditorContext } from "../cssContext";
import { Container, ContainerLabel } from "./CssUtils";

export const ColorPickerInput = (props: {
    isLabelOnTop: boolean;
    name: string;
    onChangeInput: any;
    isAddToClass: boolean;
    label: any;
}) => {
    const [cssState, setCssState] = useContext(CssEditorContext);
    const handleChange = (event: any) => {
        if (props.onChangeInput) {
            props.onChangeInput(event.target.value);
        }
        if (props.isAddToClass) {
            setCssState(props.name, event.target.value);
        }
    };

    const Content = () => (
        <div class="flex ai:center b:1px|solid|lightgrey p:5 r:5">
            <input
                type="color"
                class="color-picker__input-color mr:10 cursor:pointer; h:25px w:30px r:5 p:0 bg:#ffffff b:none"
                value={cssState[props.name] ?? "#000"}
                onInput={handleChange}
            />
            <input
                type="text"
                class="b:none w:100% f:14 outline:none"
                value={cssState[props.name] ?? "#000"}
                onInput={handleChange}
            />
        </div>
    );

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
};