import {createSignal} from "solid-js";
import {Icon} from "@iconify-icon/solid";
import {StyleCSSComponents} from "./StyleCSSComponents";

const sizeTypes = ['px', '%', 'em', 'rem', 'vh', 'vw'];
const timesTypes = ['s', 'ms'];

const {IconifyIcon} = StyleCSSComponents()
const AllSVGIcon = () => <svg viewBox="0 0 24 24" role="presentation" style="width: 20px; height: 20px;">
    <path d="M3,21V3H21V21H3M5,5V19H19V5H5Z" style="fill: currentcolor;"></path>
</svg>
const CustomSVGIcon = () => <svg viewBox="0 0 24 24" role="presentation" style="width: 20px; height: 20px;">
    <path
        d="M15,21H17V19H15M19,21H21V19H19M7,21H9V19H7M11,21H13V19H11M19,17H21V15H19M19,13H21V11H19M3,3V21H5V5H21V3M19,9H21V7H19"
        style="fill: currentcolor;"></path>
</svg>

const Icons = {
    visibility: {
        yes: <IconifyIcon icon={"solar:eye-broken"}/>,
        no: <IconifyIcon icon={"ant-design:eye-invisible-outlined"}/>,
    },
    flex: {
        auto: <IconifyIcon icon="mi:close"/>,
        expand: <IconifyIcon icon="gravity-ui:chevrons-expand-horizontal"/>,
        collapse: <IconifyIcon icon="gravity-ui:chevrons-collapse-horizontal"/>,
    },
    direction: {
        horizontal: <IconifyIcon icon="majesticons:arrow-right-line"/>,
        horizontalReverse: <IconifyIcon icon="majesticons:arrow-left-line"/>,
        vertical: <IconifyIcon icon="majesticons:arrow-down-line"/>,
        verticalReverse: <IconifyIcon icon="majesticons:arrow-up-line"/>,
    },
    justify: {
        start: <IconifyIcon icon="solar:align-left-outline"/>,
        center: <IconifyIcon icon="solar:align-horizontal-center-outline"/>,
        end: <IconifyIcon icon="solar:align-right-outline"/>,
        spaceBetween: <IconifyIcon icon="material-symbols:align-space-between"/>,
        spaceAround: <IconifyIcon icon="material-symbols:align-space-around-rounded"/>,
        spaceEvenly: <IconifyIcon icon="material-symbols:align-justify-space-even-rounded"/>,
    },
    align: {
        stretch: <IconifyIcon icon="material-symbols:align-items-stretch-rounded"/>,
        start: <IconifyIcon icon="material-symbols:align-start-rounded"/>,
        center: <IconifyIcon icon="material-symbols:align-center-rounded"/>,
        end: <IconifyIcon icon="material-symbols:align-end-rounded"/>,
    }
}

const GeneralSection = {
    visibility: {
        component: 'toggleButton',
        label: 'Visibility',
        name: 'visibility',
        options: [
            {key: Icons.visibility.yes, value: true},
            {key: Icons.visibility.no, value: false}
        ],
        state: createSignal(true)
    },
};

const LayoutSection = {
    display: {
        name: 'display',
        label: 'Display',
        component: 'select',
        options: ['block', 'inline', 'inline block', 'flex', 'none'],
        state: createSignal('block')
    },
    flex: {
        name: 'flex',
        label: 'Flex',
        component: 'buttonGroups', isLabelOnTop: true,
        options: [
            {key: Icons.flex.auto, value: 'auto'},
            {key: Icons.flex.expand, value: 'center'},
            {key: Icons.flex.collapse, value: 'end'},
            {key: <CustomSVGIcon/>, value: 'custom'},
        ],
        state: createSignal('auto')
    },
    direction: {
        name: 'flex-direction',
        label: 'Direction',
        component: 'buttonGroups', isLabelOnTop: true,
        options: [
            {key: Icons.direction.horizontal, value: 'start'},
            {key: Icons.direction.horizontalReverse, value: 'center'},
            {key: Icons.direction.vertical, value: 'end'},
            {key: Icons.direction.verticalReverse, value: 'end'},
        ],
        state: createSignal('start')
    },
    justify: {
        name: 'justify-content',
        label: 'Justify',
        component: 'buttonGroups', isLabelOnTop: true,
        options: [
            {key: Icons.justify.start, value: 'start'},
            {key: Icons.justify.center, value: 'center'},
            {key: Icons.justify.end, value: 'end'},
            {key: Icons.justify.spaceAround, value: 'space-around'},
            {key: Icons.justify.spaceBetween, value: 'space-between'},
            {key: Icons.justify.spaceEvenly, value: 'space-evenly'},
        ],
        state: createSignal('start')
    },
    align: {
        name: 'align-items',
        label: 'Align',
        component: 'buttonGroups', isLabelOnTop: true,
        options: [
            {key: Icons.align.stretch, value: 'start'},
            {key: Icons.align.start, value: 'center'},
            {key: Icons.align.center, value: 'end'},
            {key: Icons.align.end, value: 'end'},
        ],
        state: createSignal('start')
    },
    order: {
        name: 'Order',
        label: 'Order',
        type: 'number',
        component: 'textFieldOptions',
        state: createSignal('0'),
        leftIcon: (
            <button style={{border: 'none', background: 'transparent', cursor: 'pointer'}}>
                <Icon icon="gg:scroll-v" style={{color: 'grey'}}/>
            </button>
        )
    }
};

const SizeSection = {
    size: {
        'name': 'size Grid',
        'padding': '5px',
        'gap': '5px 10px',
        'component': 'grid',
        'grid-template-columns': 'repeat(2, auto)',
        children: [
            {
                name: 'height',
                type: 'number', isLabelOnTop: true,
                label: 'Height',
                component: 'textFieldOptions',
                options: sizeTypes,
                state: createSignal(0),
                optionState: createSignal('px'),
            },
            {
                name: 'width',
                type: 'number', isLabelOnTop: true,
                label: 'Width',
                component: 'textFieldOptions',
                options: sizeTypes,
                state: createSignal(0),
                optionState: createSignal('px'),
            },
            {
                name: 'min-height',
                type: 'number', isLabelOnTop: true,
                label: 'Min height',
                component: 'textFieldOptions',
                options: sizeTypes,
                state: createSignal(0),
                optionState: createSignal('px'),
            },
            {
                name: 'min-width',
                type: 'number', isLabelOnTop: true,
                label: 'Min width',
                component: 'textFieldOptions',
                options: sizeTypes,
                state: createSignal(0),
                optionState: createSignal('px'),
            },
            {
                name: 'max-height',
                type: 'number', isLabelOnTop: true,
                label: 'Max height',
                component: 'textFieldOptions',
                options: sizeTypes,
                state: createSignal(0),
                optionState: createSignal('px'),
            },
            {
                name: 'max-width',
                type: 'number', isLabelOnTop: true,
                label: 'Max width',
                component: 'textFieldOptions',
                options: sizeTypes,
                state: createSignal(0),
                optionState: createSignal('px'),
            }
        ]
    }
};

const SpaceSection = {
    space: {
        'name': 'size Grid',
        'padding': '5px',
        'gap': '5px 10px',
        'align': 'end',
        'component': 'grid',
        'grid-template-columns': '1fr 25%',
        children: [
            {
                name: 'padding',
                type: 'number', isLabelOnTop: true,
                label: 'Padding',
                component: 'textFieldOptions',
                options: sizeTypes,
                state: createSignal(0),
                optionState: createSignal('px'),
            },
            {
                name: 'paddingType',
                label: false,
                component: 'buttonGroups',
                options: [
                    {key: <AllSVGIcon/>, value: 'all'},
                    {key: <CustomSVGIcon/>, value: 'custom'},
                ],
                state: createSignal('all')
            },
        ]
    },
    margin: {
        'name': 'size Grid',
        'padding': '5px',
        'gap': '5px 10px',
        'align': 'end',
        'component': 'grid',
        'grid-template-columns': '1fr 25%',
        children: [
            {
                name: 'margin',
                type: 'number', isLabelOnTop: true,
                label: 'Margin',
                component: 'textFieldOptions',
                options: sizeTypes,
                state: createSignal(0),
                optionState: createSignal('px'),
            },
            {
                name: 'marginType',
                label: false,
                component: 'buttonGroups',
                options: [
                    {key: <AllSVGIcon/>, value: 'all'},
                    {key: <CustomSVGIcon/>, value: 'custom'},
                ],
                state: createSignal('all')
            },
        ]
    }
};

const PositionSection = {
    position: {
        name: 'position',
        label: 'Position',
        component: 'select',
        options: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
        state: createSignal('static')
    },
};

const TypographySection = {
    fontFamily: {
        name: 'font-family',
        label: 'Font',
        isLabelOnTop: true,
        component: 'select',
        options: ['Arial Black', 'Brush Script MT', 'Comic Sans MS', 'Courier New', 'Georgia', 'Helvetica', 'Impact', 'Lucida Sans Unicode', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'],
        state: createSignal('')
    },
    colorPicker: {
        name: 'color',
        label: 'Color',
        isLabelOnTop: true,
        component: 'colorPicker',
        state: createSignal('#000')
    },
    typography: {
        'name': 'size Grid',
        'padding': '5px 0px 5px 0px',
        'gap': '5px 10px',
        'component': 'grid',
        'grid-template-columns': 'repeat(2, auto)',
        children: [
            {
                name: 'font-size',
                type: 'number', isLabelOnTop: true,
                label: 'Size',
                component: 'textFieldOptions',
                options: sizeTypes,
                state: createSignal(0),
                optionState: createSignal('px'),
            },
            {
                name: 'font-weight',
                label: 'Weight',
                isLabelOnTop: true,
                component: 'select',
                options: ['thin', 'extra-light', 'light', 'normal', 'medium', 'semi-bold', 'bold', 'extra-bold', 'ultra-bold'],
                state: createSignal('normal')
            },
            {
                name: 'line-height',
                type: 'number', isLabelOnTop: true,
                label: 'Line height',
                component: 'textFieldOptions',
                options: sizeTypes,
                state: createSignal(0),
                optionState: createSignal('px'),
            },
            {
                name: 'letter-spacing',
                type: 'number', isLabelOnTop: true,
                label: 'Spacing',
                component: 'textFieldOptions',
                options: sizeTypes,
                state: createSignal(0),
                optionState: createSignal('px'),
            },
            {
                name: 'text-align',
                label: 'Align',
                isLabelOnTop: true,
                component: 'select',
                options: ['left', 'center', 'right', 'justify'],
                state: createSignal('left')
            },
            {
                name: 'text-decoration',
                label: 'Decoration',
                isLabelOnTop: true,
                component: 'select',
                options: ['none', 'underline', 'overline', 'line through'],
                state: createSignal('none')
            },
            {
                name: 'text-transform',
                label: 'Transform',
                isLabelOnTop: true,
                component: 'select',
                options: ['none', 'capitalize', 'uppercase', 'lowercase'],
                state: createSignal('none')
            },
            {
                name: 'direction',
                label: 'Direction',
                isLabelOnTop: true,
                component: 'select',
                options: ['LTR', 'RTL'],
                state: createSignal('LTR')
            },
        ]
    },
    whiteSpace: {
        name: 'white-space',
        label: 'Breaking',
        isLabelOnTop: true,
        component: 'select',
        options: ['normal', 'no wrap', 'pre', 'pre wrap', 'pre line', 'break spaces'],
        state: createSignal('normal')
    },
};

const BackgroundSection = {
    background: {
        name: 'Shadow',
        component: 'dataEditor',
        options: createSignal([]),
        openMenu: createSignal(null),
        dialogLabel: 'Adjust Shadow',
        fallback: 'No Shadow Effects',
        children: {
            style: {
                component: 'toggleButton',
                label: false,
                name: 'Style',
                options: [
                    {key: 'Outside', value: ''},
                    {key: 'Inside', value: 'inset'}
                ],
                state: createSignal('')
            },
            shadow: {
                name: 'Shadow Grid',
                component: 'grid',
                'gap': '0px 10px',
                'grid-template-columns': 'repeat(2, auto)',
                children: [
                    {
                        name: 'X Offset',
                        label: 'X Offset',
                        isLabelOnTop: true,
                        type: 'number',
                        component: 'textFieldOptions',
                        options: sizeTypes,
                        state: createSignal(null),
                        optionState: createSignal('px')
                    },
                    {
                        name: 'Y Offset',
                        label: 'Y Offset',
                        isLabelOnTop: true,
                        type: 'number',
                        component: 'textFieldOptions',
                        options: sizeTypes,
                        state: createSignal(null),
                        optionState: createSignal('px')
                    },
                    {
                        name: 'Blur',
                        label: 'Blur',
                        isLabelOnTop: true,
                        type: 'number',
                        component: 'textFieldOptions',
                        options: sizeTypes,
                        state: createSignal(null),
                        optionState: createSignal('px')
                    },
                    {
                        name: 'Spread',
                        type: 'number',
                        label: 'Spread',
                        isLabelOnTop: true,
                        component: 'textFieldOptions',
                        options: sizeTypes,
                        state: createSignal(null),
                        optionState: createSignal('px')
                    }
                ]
            }
        },
        label: 'Box Shadow'
    },
    backgroundColor: {
        name: 'background-color',
        label: 'Background Color',
        isLabelOnTop: true,
        component: 'colorPicker',
        state: createSignal('#ffffff')
    },
    clip: {
        name: 'clip',
        label: 'Clip',
        isLabelOnTop: true,
        component: 'select',
        options: ['Border Box', 'Padding Box', 'Content Box', 'Text'],
        state: createSignal('Border Box')
    },
};

const BorderSection = {
    borderRadius: {
        'name': 'size Grid',
        'padding': '5px',
        'gap': '5px 10px',
        'align': 'end',
        'component': 'grid',
        'grid-template-columns': '1fr 25%',
        children: [
            {
                name: 'border-radius',
                type: 'number',
                isLabelOnTop: true,
                label: 'Border Radius',
                component: 'textFieldOptions',
                options: sizeTypes,
                state: createSignal(0),
                optionState: createSignal('px'),
            },
            {
                name: 'borderRadiusType',
                label: false,
                component: 'buttonGroups',
                options: [
                    {key: <AllSVGIcon/>, value: 'all'},
                    {key: <CustomSVGIcon/>, value: 'custom'},
                ],
                state: createSignal('all')
            },
        ]
    },
    borderWidth: {
        'name': 'size Grid',
        'padding': '5px',
        'gap': '5px 10px',
        'align': 'end',
        'component': 'grid',
        'grid-template-columns': '1fr 25%',
        children: [
            {
                name: 'border-width',
                type: 'number', isLabelOnTop: true,
                label: 'Border Width',
                component: 'textFieldOptions',
                options: sizeTypes,
                state: createSignal(0),
                optionState: createSignal('px'),
            },
            {
                name: 'border-widthType',
                label: false,
                component: 'buttonGroups',
                options: [
                    {key: <AllSVGIcon/>, value: 'all'},
                    {key: <CustomSVGIcon/>, value: 'custom'},
                ],
                state: createSignal('all')
            },
        ]
    },
    borderStyle: {
        'name': 'size Grid',
        'padding': '5px',
        'gap': '5px 10px',
        'align': 'end',
        'component': 'grid',
        'grid-template-columns': '1fr 25%',
        children: [
            {
                name: 'border-style',
                label: 'Border Style',
                isLabelOnTop: true,
                component: 'select',
                options: ['none', 'solid', 'dotted', 'dashed', 'double', 'groove', 'Ridge', 'inset', 'outset'],
                state: createSignal('none')
            },
            {
                name: 'borderStyleType',
                label: false,
                component: 'buttonGroups',
                options: [
                    {key: <AllSVGIcon/>, value: 'all'},
                    {key: <CustomSVGIcon/>, value: 'custom'},
                ],
                state: createSignal('all')
            },
        ]
    },
    borderColor: {
        'name': 'size Grid',
        'padding': '5px',
        'gap': '5px 10px',
        'align': 'end',
        'component': 'grid',
        'grid-template-columns': '1fr 25%',
        children: [
            {
                name: 'border-color',
                label: 'Border Color',
                isLabelOnTop: true,
                component: 'colorPicker',
                state: createSignal('#ffffff')
            },
            {
                name: 'borderColorType',
                label: false,
                component: 'buttonGroups',
                options: [
                    {key: <AllSVGIcon/>, value: 'all'},
                    {key: <CustomSVGIcon/>, value: 'custom'},
                ],
                state: createSignal('all')
            },
        ]
    }
};

const EffectsSection = {
    opacity: {
        'name': 'size Grid',
        'padding': '5px 0px 5px 0px',
        'gap': '5px 10px',
        'component': 'grid',
        'grid-template-columns': '1fr 50%',
        children: [
            {
                name: 'opacity',
                type: 'number', isLabelOnTop: true,
                label: 'Opacity',
                component: 'textFieldOptions',
                options: sizeTypes,
                state: createSignal(0),
                optionState: createSignal('px'),
            },
            {
                name: 'blend-mode',
                label: 'Blend Mode',
                isLabelOnTop: true,
                component: 'select',
                options: ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color dodge', 'color burn', 'hard light', 'soft light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'],
                state: createSignal('normal')
            },
        ]
    },
    cursor: {
        name: 'cursor',
        label: 'Cursor',
        isLabelOnTop: true,
        component: 'select',
        options: ['auto', 'pointer', 'copy', 'crosshair', 'grab', 'grabbing', 'help', 'move', 'text'],
        state: createSignal('auto')
    },
    divider: {
        component: 'divider',
    },
    boxShadow: {
        name: 'box-shadow',
        component: 'dataEditor',
        options: createSignal([]),
        openMenu: createSignal(null),
        dialogLabel: 'Adjust Shadow',
        fallback: 'No Shadow Effects',
        children: {
            style: {
                component: 'toggleButton',
                label: false,
                name: 'Style',
                options: [
                    {key: 'Outside', value: ''},
                    {key: 'Inside', value: 'inset'}
                ],
                state: createSignal(null)
            },
            shadow: {
                name: 'Shadow Grid',
                component: 'grid',
                'grid-template-columns': 'repeat(2, auto)',
                children: [
                    {
                        name: 'X Offset',
                        label: 'X Offset',
                        isLabelOnTop: true,
                        type: 'number',
                        component: 'textFieldOptions',
                        options: sizeTypes,
                        state: createSignal(null),
                        optionState: createSignal('px')
                    },
                    {
                        name: 'Y Offset',
                        label: 'Y Offset',
                        isLabelOnTop: true,
                        type: 'number',
                        component: 'textFieldOptions',
                        options: sizeTypes,
                        state: createSignal(null),
                        optionState: createSignal('px')
                    },
                    {
                        name: 'Blur',
                        label: 'Blur',
                        isLabelOnTop: true,
                        type: 'number',
                        component: 'textFieldOptions',
                        options: sizeTypes,
                        state: createSignal(null),
                        optionState: createSignal('px')
                    },
                    {
                        name: 'Spread',
                        type: 'number',
                        label: 'Spread',
                        isLabelOnTop: true,
                        component: 'textFieldOptions',
                        options: sizeTypes,
                        state: createSignal(null),
                        optionState: createSignal('px')
                    }
                ]
            }
        },
        label: 'Box Shadow'
    },
    textShadow: {
        name: 'text-shadow',
        component: 'dataEditor',
        options: createSignal([]),
        openMenu: createSignal(null),
        dialogLabel: 'Adjust Shadow',
        fallback: 'No Shadow Effects',
        children: {
            shadow: {
                name: 'Shadow Grid',
                component: 'grid',
                'grid-template-columns': 'repeat(2, auto)',
                children: [
                    {
                        name: 'X Offset',
                        label: 'X Offset',
                        isLabelOnTop: true,
                        type: 'number',
                        component: 'textFieldOptions',
                        options: sizeTypes,
                        state: createSignal(null),
                        optionState: createSignal('px')
                    },
                    {
                        name: 'Y Offset',
                        label: 'Y Offset',
                        isLabelOnTop: true,
                        type: 'number',
                        component: 'textFieldOptions',
                        options: sizeTypes,
                        state: createSignal(null),
                        optionState: createSignal('px')
                    },
                    {
                        name: 'Blur',
                        label: 'Blur',
                        isLabelOnTop: true,
                        type: 'number',
                        component: 'textFieldOptions',
                        options: sizeTypes,
                        state: createSignal(null),
                        optionState: createSignal('px')
                    },
                    {
                        name: 'Spread',
                        type: 'number',
                        label: 'Spread',
                        isLabelOnTop: true,
                        component: 'textFieldOptions',
                        options: sizeTypes,
                        state: createSignal(null),
                        optionState: createSignal('px')
                    }
                ]
            }
        },
        label: 'Text Shadow'
    },
    filter: {
        name: 'filter',
        component: 'dataEditor',
        options: createSignal([]),
        openMenu: createSignal(null),
        dialogLabel: 'Adjust Filter',
        fallback: 'No Filter Effects',
        children: {
            shadow: {
                name: 'Shadow Grid',
                component: 'grid',
                'gap': '10px',
                'grid-template-columns': '1fr 45%',
                children: [
                    {
                        name: 'type',
                        label: 'Type',
                        isLabelOnTop: true,
                        component: 'select',
                        options: ['blur', 'brightness', 'contrast', 'grayscale', 'hue rotate', 'invert', 'saturate', 'sepia'],
                        state: createSignal('blur')
                    },
                    {
                        name: 'value',
                        label: 'Value',
                        isLabelOnTop: true,
                        type: 'number',
                        component: 'textFieldOptions',
                        options: sizeTypes,
                        state: createSignal(null),
                        optionState: createSignal('px')
                    },
                ]
            }
        },
        label: 'Filter'
    },
    backdropFilter: {
        name: 'backdrop-filter',
        component: 'dataEditor',
        options: createSignal([]),
        openMenu: createSignal(null),
        dialogLabel: 'Backdrop Filter',
        children: {
            shadow: {
                name: 'Shadow Grid',
                component: 'grid',
                'gap': '10px',
                'grid-template-columns': '1fr 45%',
                children: [
                    {
                        name: 'type',
                        label: 'Type',
                        isLabelOnTop: true,
                        component: 'select',
                        options: ['blur', 'brightness', 'contrast', 'grayscale', 'hue rotate', 'invert', 'saturate', 'sepia'],
                        state: createSignal('blur')
                    },
                    {
                        name: 'value',
                        label: 'Value',
                        isLabelOnTop: true,
                        type: 'number',
                        component: 'textFieldOptions',
                        options: sizeTypes,
                        state: createSignal(null),
                        optionState: createSignal('px')
                    },
                ]
            }
        },
        label: 'Backdrop Filter'
    },
    transition: {
        name: 'transition',
        component: 'dataEditor',
        options: createSignal([]),
        openMenu: createSignal(null),
        dialogLabel: 'Adjust Transition',
        fallback: 'No transition',
        children: {
            type: {
                name: 'type',
                label: 'Type',
                isLabelOnTop: true,
                component: 'select',
                options: ['height', 'width', 'min height', 'min width', 'max height', 'max width', 'padding', 'margin', 'color', 'font', 'font size', 'line height', 'letter height', 'border', 'border radius', 'background', 'opacity', 'box shadow', 'text shadow', 'filter', 'backdrop filter', 'transform', 'all'],
                state: createSignal('opacity')
            },
            easing: {
                name: 'easing',
                label: 'Easing',
                isLabelOnTop: true,
                component: 'select',
                options: ['ease', 'ease-in', 'ease-in-out', 'ease-out', 'linear'],
                state: createSignal('ease')
            },
            shadow: {
                'name': 'size Grid',
                'padding': '5px 0px 5px 0px',
                'gap': '5px 10px',
                'component': 'grid',
                'grid-template-columns': '1fr 45%',
                children: [
                    {
                        name: 'duration',
                        label: 'Duration',
                        isLabelOnTop: true,
                        type: 'number',
                        component: 'textFieldOptions',
                        options: timesTypes,
                        state: createSignal(null),
                        optionState: createSignal('s')
                    },
                    {
                        name: 'delay',
                        label: 'Delay',
                        isLabelOnTop: true,
                        type: 'number',
                        component: 'textFieldOptions',
                        options: timesTypes,
                        state: createSignal(null),
                        optionState: createSignal('s')
                    },
                ]
            }
        },
        label: 'Transition'
    },
    transform: {
        name: 'transform',
        component: 'dataEditor',
        options: createSignal([]),
        openMenu: createSignal(null),
        dialogLabel: 'Adjust Transform',
        children: {
            shadow: {
                'name': 'Grid',
                'padding': '5px 0px 5px 0px',
                'gap': '5px 10px',
                'component': 'grid',
                'grid-template-columns': '1fr 45%',
                children: [
                    {
                        name: 'type',
                        label: 'Type', isLabelOnTop: true,
                        component: 'select',
                        options: ['move x', 'move y', 'move z', 'rotate x', 'rotate y', 'rotate z', 'scale', 'scale x', 'scale y', 'scale z', 'skew x', 'skew y'],
                        state: createSignal('move x')
                    },
                    {
                        name: 'value',
                        type: 'number',
                        label: 'Value',
                        isLabelOnTop: true,
                        component: 'textFieldOptions',
                        options: sizeTypes,
                        state: createSignal(null),
                        optionState: createSignal('px')
                    }
                ]
            }
        },
        label: 'Transform'
    },
    divider2: {
        component: 'divider',
    },
    transformOrigin: {
        'name': 'size Grid',
        'padding': '5px',
        'gap': '5px 10px',
        'align': 'end',
        'component': 'grid',
        'grid-template-columns': '1fr 25%',
        children: [
            {
                name: 'transform-origin',
                type: 'number', isLabelOnTop: true,
                label: 'Transform Origin',
                component: 'textFieldOptions',
                options: sizeTypes,
                state: createSignal(0),
                optionState: createSignal('px'),
            },
            {
                name: 'transformOriginType',
                label: false,
                component: 'buttonGroups',
                options: [
                    {key: <AllSVGIcon/>, value: 'all'},
                    {key: <CustomSVGIcon/>, value: 'custom'},
                ],
                state: createSignal('all')
            },
        ]
    },
    overflow: {
        'name': 'size Grid',
        'padding': '5px',
        'gap': '5px 10px',
        'align': 'end',
        'component': 'grid',
        'grid-template-columns': '1fr 25%',
        children: [
            {
                name: 'overflow',
                label: 'Overflow', isLabelOnTop: true,
                component: 'select',
                options: ['visible', 'hidden', 'scroll', 'auto'],
                state: createSignal('visible')
            },
            {
                name: 'overflowType',
                label: false,
                component: 'buttonGroups',
                options: [
                    {key: <AllSVGIcon/>, value: 'all'},
                    {key: <CustomSVGIcon/>, value: 'custom'},
                ],
                state: createSignal('all')
            },
        ]
    },
    backface: {
        component: 'toggleButton',
        label: 'Backface',
        isLabelOnTop: true,
        name: 'backface',
        options: [
            {key: 'Visible', value: true},
            {key: 'Hidden', value: false}
        ],
        state: createSignal(true)
    },
    divider4: {
        title: 'Children transform',
        component: 'divider',
    },
    perspective: {
        'name': 'size Grid',
        'padding': '5px',
        'gap': '5px 10px',
        'align': 'end',
        'component': 'grid',
        'grid-template-columns': '1fr 25%',
        children: [
            {
                name: 'perspective',
                type: 'number', isLabelOnTop: true,
                label: 'Perspective',
                component: 'textFieldOptions',
                options: sizeTypes,
                state: createSignal(0),
                optionState: createSignal('px'),
            },
            {
                name: 'perspectiveType',
                label: 'Type',
                isLabelOnTop: true,
                component: 'buttonGroups',
                options: [
                    {key: '2D', value: '2d'},
                    {key: '3D', value: '3d'},
                ],
                state: createSignal('2d')
            },
        ]
    },
    perspectiveOrigin: {
        'name': 'size Grid',
        'padding': '5px',
        'gap': '5px 10px',
        'align': 'end',
        'component': 'grid',
        'grid-template-columns': '1fr 25%',
        children: [
            {
                name: 'perspective-origin',
                type: 'number', isLabelOnTop: true,
                label: 'Perspective origin',
                component: 'textFieldOptions',
                options: sizeTypes,
                state: createSignal(0),
                optionState: createSignal('%'),
            },
            {
                name: 'perspectiveOriginType',
                label: false,
                component: 'buttonGroups',
                options: [
                    {key: <AllSVGIcon/>, value: 'all'},
                    {key: <CustomSVGIcon/>, value: 'custom'},
                ],
                state: createSignal('all')
            },
        ]
    },
};

const JSONSchema = {
    General: GeneralSection,
    Layout: LayoutSection,
    Size: SizeSection,
    Space: SpaceSection,
    Position: PositionSection,
    Typography: TypographySection,
    Background: BackgroundSection,
    Border: BorderSection,
    Effects: EffectsSection
};

export default JSONSchema;