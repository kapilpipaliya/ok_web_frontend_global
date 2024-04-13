import {Tab, TabContainer, TabList, Tabs} from "../solid-blocks/blocks";
import {Vertex} from "../../lib/graph";
import StyleEditor from "./styleEditor";
import {StyleCSSComponents} from "./StyleCSSComponents";
import {createEffect, createSignal, For, onCleanup, onMount, Show} from "solid-js";
import {Icon} from "@iconify-icon/solid";

export const ClassDesignTab = (props: {
    component: string;
    meta: Vertex;
    title?: string;
    data?: Vertex;
    setValue?: (data: any) => void;
    disabled?: boolean;
    isRealTime?: boolean;
    txnId?: number;
}) => {
    const {Container} = StyleCSSComponents();
    const TextEditor = () => {
        const [text, setText] = createSignal("#i3vvs {\n" +
            "\tcolor:black;\n" +
            "\tborder-top-left-radius:35px;\n" +
            "\tborder-top-right-radius:35px;\n" +
            "\tborder-bottom-right-radius:35px;\n" +
            "\tborder-bottom-left-radius:35px;\n" +
            "\tmax-width:100%;\n" +
            "\tmargin-top:38px;\n" +
            "\tmargin-right:38px;\n" +
            "\tmargin-bottom:38px;\n" +
            "\tmargin-left:100px;\n" +
            "}");

        const style = {
            color: "black",
            border: "1px solid #ccc",
            padding: "10px",
            margin: "5px",
            width: "100%",
            'min-height': '5rem',
            'height': '20rem',
            'border-radius': "6px"
        };

        // This effect could be used for autosaving or other side effects as the text changes.
        createEffect(() => {
            console.log("Text changed: ", text());
            // Here you could include logic to save the text to local storage, an API, etc.
        });

        return (
            <textarea
                style={style}
                value={text()}
                onInput={(e) => setText(e.target.value)}
                placeholder="Start typing..."
            />
        );
    };
    return <tr class={'min-w:100% m:5px'}>
        <td colspan="2">
            <Tabs>
                <TabList class={'m:5px'}>
                    <Tab class={'w:50%'}>Design</Tab>
                    <Tab class={'w:50%'}>Code</Tab>
                </TabList>
                <TabContainer>
                    <Container>
                        <StyleEditor/>
                    </Container>
                </TabContainer>
                <TabContainer>
                    <Container>
                        <TextEditor/>
                    </Container>
                </TabContainer>
            </Tabs>
        </td>
    </tr>
}