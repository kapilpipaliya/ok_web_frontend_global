import {Tab, TabContainer, TabList, Tabs} from "../solid-blocks/blocks";
import {Vertex} from "../../lib/graph";
import StyleEditor from "./styleEditor";
import {StyleCSSComponents} from "./StyleCSSComponents";
import {createEffect, createSignal} from "solid-js";
import {createStore, reconcile} from "solid-js/store";
import {CssEditorContext} from "./cssEditorContext";

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

    const [cssState, setCssState] = createStore({} as {[key: string]: any});

    createEffect(() => {
        const valueString: string = props.data?.P[props.meta.P.name] ?? '';

        const cssRules = {} as {[key: string]: string};

        for (const [key, value] of valueString.split(' ').map(rule => rule.split(':'))) {
            if (key === '') continue;
            cssRules[key] = value;
        }
        setCssState(reconcile(cssRules));
    })

    function getCssValue() {
        return Object.entries(cssState).map(([key, value]) => `${key}:${value}`).join(" ");
    }

    createEffect(()=> {
        props.setValue?.(getCssValue());
    })

    const TextEditor = () => {
        const [text, setText] = createSignal('');
        createEffect(() => {
            setText(getCssValue());
        })

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

        // This effect could be used for auto-saving or other side effects as the text changes.
        createEffect(() => {
            console.log("Text changed: ", text());
            // Here you could include logic to save the text to local storage, an API, etc.
        });

        return (
            <textarea
                style={style}
                value={text()}
                onInput={(e) => {
                    props.setValue?.(e.target.value);
                    return setText(e.target.value);
                }}
                placeholder="Start typing..."
            />
        );
    };
    return <CssEditorContext.Provider value={[cssState, setCssState]}><tr class={'min-w:100% m:5px'}>
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
    </tr></CssEditorContext.Provider>
}