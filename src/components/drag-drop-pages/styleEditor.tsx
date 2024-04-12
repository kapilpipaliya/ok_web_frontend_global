import {createSignal, For, Show} from 'solid-js';
import {StyleCSSComponents} from "../StyleCSSComponents";
import '../css/componentUtilCSS.css'
import {Icon} from "@iconify-icon/solid";
import {RenderComponent} from "../RenderComponent";

const StyleEditor = () => {
    const {
        IconifyIcon,
    } = StyleCSSComponents();

    const units = ['px', '%', 'em', 'rem', 'vh', 'vw'];

    const JSONSchema = {
        'General': {
            'visibility': {
                'component': 'toggleButton',
                'label': 'Visibility',
                'name': 'Visibility',
                'options': [{
                    'key': <IconifyIcon icon={'solar:eye-broken'}/>,
                    'value': true
                }, {
                    'key': <IconifyIcon icon={'ant-design:eye-invisible-outlined'}/>,
                    'value': false
                }
                ],
                'state': createSignal(true)
            },
        },
        'Layout': {
            'display': {
                'name': 'Display',
                'label': 'Display',
                'component': 'select',
                'options': ['block', 'inline', 'inline block', 'flex', 'none'],
                'state': createSignal('block')
            },
        },
        'Size': {
            'height': {
                'name': 'Height',
                'label': 'Height',
                'component': 'textField',
                'state': createSignal('0'),
            },
            'width': {
                'name': 'Width',
                'type': 'number',
                'label': 'Width',
                'component': 'textFieldOptions',
                'option': units,
                'state': createSignal('0'),
                'optionState': createSignal('%'),
                'leftIcon': <button style={{border: 'none', background: 'transparent', cursor: 'pointer'}}>
                    <Icon icon={'gg:scroll-v'} style={{color: "grey"}}/>
                </button>
            },
        },
        'Alignment': {
            'direction': {
                'name': 'Direction',
                'label': 'Direction',
                'component': 'buttonGroups',
                'options': [
                    {'key': <IconifyIcon icon={'solar:align-left-outline'}/>, 'value': 'start'},
                    {'key': <IconifyIcon icon={'solar:align-horizontal-center-outline'}/>, 'value': 'center'},
                    {'key': <IconifyIcon icon={'solar:align-right-outline'}/>, 'value': 'end'},
                    {'key': <IconifyIcon icon={'material-symbols:align-space-between'}/>, 'value': 'space-between'},
                    {
                        'key': <IconifyIcon icon={'material-symbols:align-space-around-rounded'}/>,
                        'value': 'space-around'
                    },
                    {
                        'key': <IconifyIcon icon={'material-symbols:align-justify-space-even-rounded'}/>,
                        'value': 'space-evenly'
                    },
                ],
                'state': createSignal('start'),
            }
        },
        'Shadow': {
            'Box Shadow': {
                'name': 'Shadow',
                'component': 'dataEditor',
                'option': createSignal([{x: 0, y: 0, blur: 5, spread: 0, color: 'black', style: ''}]),
                'openMenu': createSignal(null),
                'dialogLabel': 'Adjust Shadow',
                'fallback': 'No Shadow Effects',
                'children': {
                    'style': {
                        'component': 'toggleButton',
                        'label': false,
                        'name': 'Style',
                        'options': [{
                            'key': 'Outside',
                            'value': ''
                        }, {
                            'key': 'Inside',
                            'value': 'inset'
                        }
                        ],
                        'state': createSignal(null)
                    },
                    'shadow': {
                        'name': 'Shadow Grid',
                        'component': 'grid',
                        'grid-template-columns': 'repeat(2, auto)',
                        'children': [
                            {
                                'name': 'X Offset',
                                'label': 'X Offset',
                                'isLabelOnTop': true,
                                'type': 'number',
                                'component': 'textFieldOptions',
                                'option': units,
                                'state': createSignal(null),
                                'optionState': createSignal('px')
                            },
                            {
                                'name': 'Y Offset',
                                'label': 'Y Offset',
                                'isLabelOnTop': true,
                                'type': 'number',
                                'component': 'textFieldOptions',
                                'option': units,
                                'state': createSignal(null),
                                'optionState': createSignal('px')
                            },
                            {
                                'name': 'Blur',
                                'label': 'Blur',
                                'isLabelOnTop': true,
                                'type': 'number',
                                'component': 'textFieldOptions',
                                'option': units,
                                'state': createSignal(null),
                                'optionState': createSignal('px')
                            },
                            {
                                'name': 'Spread',
                                'type': 'number',
                                'label': 'Spread',
                                'isLabelOnTop': true,
                                'component': 'textFieldOptions',
                                'option': units,
                                'state': createSignal(null),
                                'optionState': createSignal('px')
                            },
                        ]
                    }
                },
                'label': 'Box Shadow'
            },
        }
    }

    const CollapsibleSection = (props: { index: any, title: any, properties: any }) => {
        const [isOpen, setIsOpen] = createSignal(false);
        const isFirst = () => props.index === 0;
        const isLast = () => props.index === Object.entries(JSONSchema).length - 1;

        return (
            <div class={`p:5|10 w:full b:1px|solid|lightgray ${isFirst() ? 'r:5|5|0|0' : isLast() ? 'r:0|0|5|5' : ''}`}>
                <div onClick={() => setIsOpen(!isOpen())} class={'cursor:pointer flex ai:center jc:space-between'}>
                    <span class={'f:14 font-weight:medium'}>{props.title}</span>

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

