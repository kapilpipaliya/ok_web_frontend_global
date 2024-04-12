import {createSignal, For, Show} from 'solid-js';
import '../css/componentUtilCSS.css'
import {Icon} from "@iconify-icon/solid";
import {RenderComponent} from "./RenderComponent";
import JSONSchema from "./Utils";

const StyleEditor = () => {

    const CollapsibleSection = (props: { index: any, title: any, properties: any }) => {
        const [isOpen, setIsOpen] = createSignal(false);
        const isFirst = () => props.index === 0;
        const isLast = () => props.index === Object.entries(JSONSchema).length - 1;

        return (
            <div class={`p:5|10 w:full b:1px|solid|lightgray ${isFirst() ? 'r:5|5|0|0' : isLast() ? 'r:0|0|5|5' : ''}`}>
                <div onClick={() => setIsOpen(!isOpen())} class={'cursor:pointer flex ai:center jc:space-between'}>
                    <span class={'f:15 font-weight:600'}>{props.title}</span>

                    <Icon
                        icon="uil:angle-up"
                        height={25}
                        width={25}
                        class={"cursor:pointer transform 1s ease-in-out"}
                        style={{
                            transition: "transform 0.2s linear",
                            transform: `${
                                isOpen()
                                    ? "rotate(0deg)"
                                    : "rotate(180deg)"
                            }`,
                        }}
                    />
                </div>
                <Show when={isOpen()}>
                    <hr class={'color:#e1e1e1 m:2'}/>
                    <For each={Object.entries(props.properties)}>
                        {([name, value]) => <RenderComponent value={value}/>}
                    </For>
                </Show>
            </div>
        );
    };

    return <>
        <span class={'flex ai:start jc:space-between flex-direction:column w:full mb:10 mt:10'}>
        <For each={Object.entries(JSONSchema)}>
            {([sectionName, properties], index) => (
                <CollapsibleSection title={sectionName} properties={properties} index={index()}/>
            )}
        </For>
        </span>
    </>
};

export default StyleEditor;

