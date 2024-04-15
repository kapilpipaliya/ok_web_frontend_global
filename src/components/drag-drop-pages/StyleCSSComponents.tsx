import {Icon, IconifyIconProps} from "@iconify-icon/solid";
import {
    Accessor,
    createEffect,
    createSignal,
    For,
    JSX,
    JSXElement,
    Match,
    onCleanup,
    Setter,
    Show,
    splitProps,
    Switch,
    useContext
} from "solid-js";
import {TextField} from "../solid-blocks/blocks";
import {RenderComponent} from "./RenderComponent";
import {CustomTooltip} from "../custom-component/Tooltip";
import {CssEditorContext, sizeTypes} from "./cssEditorContext";

export const StyleCSSComponents = () => {
    const AllSVGIcon = () => <svg viewBox="0 0 24 24" role="presentation" style="width: 20px; height: 20px;">
        <path d="M3,21V3H21V21H3M5,5V19H19V5H5Z" style="fill: currentcolor;"></path>
    </svg>
    const CustomSVGIcon = () => <svg viewBox="0 0 24 24" role="presentation" style="width: 20px; height: 20px;">
        <path
            d="M15,21H17V19H15M19,21H21V19H19M7,21H9V19H7M11,21H13V19H11M19,17H21V15H19M19,13H21V11H19M3,3V21H5V5H21V3M19,9H21V7H19"
            style="fill: currentcolor;"></path>
    </svg>
    const IconifyIcon = (props: IconifyIconProps) => {
        const [selected, restProps] = splitProps(props, ['icon', 'height', 'width']);
        return <Icon icon={selected.icon} height={selected.height ?? 23} width={selected.width ?? 23} {...restProps} />;
    };

    const ContainerLabel =
        (props: { title: JSXElement, showIcon?: boolean, onIconClick?: any, class?: any }) => <span
            class={`flex ai:center m:0 pt:5 font:14 font-weight:400 ${props.class}`}>{props.title}<Show
            when={props.showIcon ?? false}>
            &nbsp;<Icon onClick={props.onIconClick} icon={'mdi:close'} class={'cursor:pointer'}/></Show></span>

    const Container =
        (props: { class?: string, children: JSXElement }) => <span
            class={`w:full min-h:45px flex ai:center jc:space-between flex-shrink:0 ${props.class}`}>{props.children}</span>

    const DisplaySelector = (props: {
        name: string,
        options: any,
        isLabelOnTop: boolean,
        label: string,
    }) => {
        const [cssState, setCssState] = useContext(CssEditorContext);
        const [isActive, setIsActive] = createSignal(false);
        const toggleDropdown = () => setIsActive(!isActive());
        const selected = () => cssState[props.name] || props.options[0].value || props.options[0];

        const selectOption = (option: any) => {
            setCssState(props.name, option.value || option);
            setIsActive(false);
        };

        const handleClickOutside = (event: MouseEvent) => {
            const dropdown = document.getElementById(`select-dropdown${props.label}`);
            if (dropdown && !dropdown.contains(event.target as Node)) {
                setIsActive(false);
            }
        };

        createEffect(() => {
            document.addEventListener('mousedown', handleClickOutside);
            onCleanup(() => document.removeEventListener('mousedown', handleClickOutside));
        });


        return (
            <Container>
                <Show when={props.isLabelOnTop} fallback={
                    <Show when={props.label} fallback={<Content/>}>
                        <div class={'w:100% flex jc:space-between ai:center'}>
                            <ContainerLabel title={props.label}/>
                            <Content/>
                        </div>
                    </Show>
                }>
                    <div class={'w:full'}>
                        <ContainerLabel title={props.label}/>
                        <Content/>
                    </div>
                </Show>
            </Container>
        );

        function Content() {
            return (

                <div class={`rel ${props.isLabelOnTop ? 'w:full' : 'w:50%'}`}>
                    <div
                        class={`flex ai:center jc:space-between b:1px|solid|lightgray r:5 p:2|7 f:14 ${isActive() ? 'open' : ''}`}
                        onClick={toggleDropdown}>
                        <button
                            class="select-button"
                            role="combobox"
                            aria-labelledby="select button"
                            aria-haspopup="listbox"
                            aria-controls={`select-dropdown${props.label}`}
                            aria-expanded={isActive()}
                        >
                        <span
                            class="selected-value">{selected().charAt(0).toUpperCase() + selected().slice(1)}</span>
                            <span class="arrow"></span>
                        </button>
                        <div><Icon icon={'teenyicons:down-small-outline'} height={22} width={22}/></div>
                    </div>

                    <ul class={`popup b:1px|solid|lightgray bg:white mt:2 p:4|10 r:5 w:-webkit-fill-available ${isActive() ? 'visible' : 'hidden'}`}
                        style={'max-height: 15rem;overflow: auto;scrollbar-width:thin;cursor: auto;position: absolute;outline: 0;top: 100%;text-shadow: none;text-align: left;box-shadow: -1px 0px 14px 3px rgba(17,36,38,.15);border: 1px solid rgba(34,36,38,.15);border-radius: .28571429rem;transition: opacity .1s ease;z-index: 11;will-change: transform,opacity;'}
                        role="listbox" id={`select-dropdown${props.label}`}>
                        <For each={props.options}>
                            {(option) => {
                                const label = () => option.value || option
                                return <li
                                    class={`rel f:14 flex ai:center jc:space-between p:5 cursor:pointer ${selected() !== label() ? 'bg:#efefef:hover' : 'bg:rgb(229,234,253):hover'} font-weight:${selected() === label() ? 'medium' : ''} r:5 ${selected() === label() ? 'bg:rgb(229,234,253)' : ''}`}
                                    role="option" onClick={() => selectOption(option)}>
                                    <label>
                                        {label().charAt(0).toUpperCase() + label().slice(1)}
                                    </label>
                                    <Show when={selected() === label()}>
                                        <Icon icon={'icon-park-outline:check-one'} height={22} width={22}
                                              style={{color: 'dodgerblue'}}/>
                                    </Show>
                                </li>
                            }}</For>
                    </ul>
                </div>


            );
        }
    }

    const ColorPickerInput = (props: {
        isLabelOnTop: boolean,
        name: string,
        label: any
    }) => {
        const [cssState, setCssState] = useContext(CssEditorContext);
        const handleChange = (event: any) => {
            setCssState(props.name, event.target.value);
        };

        const Content = () => <div class="flex ai:center b:1px|solid|lightgrey p:5 r:5">
            <input
                type="color"
                class="color-picker__input-color mr:10 cursor:pointer; h:25px w:30px r:5 p:0 bg:#ffffff b:none"
                value={cssState[props.name] ?? ''}
                onInput={handleChange}
            />
            <input
                type="text"
                class="b:none w:100% f:14 outline:none"
                value={cssState[props.name] ?? ''}
                onInput={handleChange}
            />
        </div>

        return (
            <Container>
                <Show when={props.isLabelOnTop} fallback={
                    <Show when={props.label} fallback={<Content/>}>
                        <div class={'w:100% flex jc:space-between ai:center'}>
                            <ContainerLabel title={props.label}/>
                            <Content/>
                        </div>
                    </Show>
                }>
                    <div class={'w:full'}>
                        <ContainerLabel title={props.label}/>
                        <Content/>
                    </div>

                </Show>
            </Container>

        );
    };

    const ButtonGroups = (props: {
        options: { key: JSX.Element; value: string; tooltip?: string }[],
        name: string,
        label: any,
        isLabelOnTop: boolean,
        onChange?: any,
    }) => {
        const [cssState, setCssState] = useContext(CssEditorContext);
        const selected = () => cssState[props.name] ?? props.options[0].value;
        const handleChange = (option: { key: JSX.Element; value: string }) => {
            props.onChange();
            setCssState(props.name, option.value);
        };

        const Content = () => <div class={`radio-inputs w:100%`}>
            <For each={props.options}>
                {(option, index) => {
                    return <label class={`radio`}>
                        <CustomTooltip message={option.tooltip ?? option.value}>
                            <input
                                type="radio"
                                name={props.name}
                                checked={selected() === option.value}
                                onChange={() => handleChange(option)}
                            />
                            <span class={`name`}>{option.key}</span>
                        </CustomTooltip>
                    </label>
                }}
            </For>
        </div>

        return <Show when={props.isLabelOnTop} fallback={
            <Show when={props.label} fallback={<Content/>}>
                <CenterDiv>
                    <ContainerLabel title={props.label} showIcon={true}/>
                    <Content/>
                </CenterDiv>
            </Show>
        }>
            <div class={'w:full'}>
                <ContainerLabel title={props.label}/>
                <Content/>
            </div>
        </Show>
    };
    const CenterDiv = (props: { children: JSXElement }) => <div
        class={'w:full flex ai:center jc:space-between'}>{props.children}</div>;

    const TextFieldWithSelectOption = (props: {
        name: string,
        options?: string[],
        onChangeInput?: any,
        leftIcon?: JSXElement,
        isLabelOnTop?: boolean,
        label?: string,
        showInside?: boolean,
        inputType?: string,
        placeholder?: string
    }) => {
        const [cssState, setCssState] = useContext(CssEditorContext);
        const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);

        createEffect(v => {
            setOption(determineSelectedOption())
        })
        const determineSelectedOption = () => {
            if (!cssState[props.name]) return props.options?.[0];
            return sizeTypes.find(unit => cssState[props.name].includes(unit));
        };

        const [selectedOption, setOption] = createSignal(determineSelectedOption());


        const handleChange = (event: any) => {
            const value = event.target.value;
            const numericValue = parseFloat(value);
            setCssState(props.name, `${numericValue}${selectedOption()}`);
            if (props.onChangeInput) {
                props.onChangeInput();
            }
        };

        const toggleDropdown = (event: any) => {
            event.stopPropagation(); // Prevent click from immediately closing the dropdown
            setIsDropdownOpen(!isDropdownOpen());
        };

        const selectOption = (option: string) => {
            setIsDropdownOpen(false);
            setOption(option);
            const value = getValueWithoutUnits(cssState[props.name]);
            setCssState(props.name, `${value}${selectedOption()}`);
        };

        const getValueWithoutUnits = (valueWithUnits: string) => {
            if (!valueWithUnits) return "";
            const unitsToRemove = ['px', '%', 'em', 'rem', 'vh', 'vw'];
            const regexPattern = new RegExp(unitsToRemove.join('|'), 'g');
            return parseFloat(valueWithUnits.replace(regexPattern, ''));
        };


        const Content = () => <div
            class={`flex ai:center jc:space-between ${props.showInside ? 'b:1px|solid|#ccc' : ''} r:5 ${props.showInside ? "p:0|5|0|5" : ""} rel ${!props.isLabelOnTop ? 'max-w:50%' : ''}`}>

            <div class={'flex ai:center'} style={{flex: '1'}}>
                <Show when={props.leftIcon || props.inputType === 'number'}>
                    <Show when={props.leftIcon} fallback={
                        <button style={{border: 'none', background: 'transparent', cursor: 'ns-resize'}}>
                            <Icon icon="gg:scroll-v" style={{color: 'grey'}}/>
                        </button>
                    }>
                        {props.leftIcon}
                    </Show>

                </Show>
                <Show when={props.showInside} fallback={<TextField
                    label={props.label}
                    type={props.inputType || 'text'}
                    placeholder={`${props.inputType === 'number' ? '0' : props.placeholder}`}
                    value={getValueWithoutUnits(cssState[props.name] ?? '')}
                    onInput={handleChange}
                    class={`f:14`}
                    style={{width: '100%'}} // Set width to 100%
                />}>
                    <input
                        type={props.inputType || 'text'}
                        placeholder={`${props.inputType === 'number' ? '0' : props.placeholder}`}
                        value={getValueWithoutUnits(cssState[props.name] ?? '')}
                        class="f:14 outline:none p:5"
                        onInput={handleChange}
                        style={{width: '100%'}}
                    />
                </Show>
            </div>
            <Show when={props.options}>
                <span onClick={toggleDropdown}
                      class={'color:lightgrey f:14 ml:5 pr:5 cursor:pointer user-select:none'}>{selectedOption!()}</span>
                <Show when={isDropdownOpen()}>
                    <div
                        class={`bg:white w:full box-shadow:0px|2px|5px|rgba(0,0,0,0.2) r:5 p:5 abs z-index:1000 top:100% left:0`}>
                        <For each={props.options}>{(option) => (
                            <div onClick={() => selectOption(option)}
                                 class={`flex ai:center jc:space-between p:5 cursor:pointer bg:#efefef:hover ${selectedOption!() === option ? 'bg:rgb(229,234,253) font-weight:medium' : 'bg:transparent'} r:5`}>
                                {option}
                                <Show when={selectedOption!() === option}>
                                    <Icon icon={'mdi:check'}/>
                                </Show>
                            </div>
                        )}</For>
                    </div>
                </Show>
            </Show>
        </div>
        /*

                const JSONSS = {
                    'visibility': {
                        'component': 'toggleButton',
                        'label': 'Visibility',
                        'name': 'Visibility',
                        'options': [
                            {'key': <IconifyIcon icon="solar:eye-broken"/>, 'value': true},
                            {'key': <IconifyIcon icon="ant-design:eye-invisible-outlined"/>, 'value': false}
                        ],
                        'state': createSignal(true)
                    },
                    'FlexGrow': {
                        name: 'Flex Grow',
                        label: 'Flex Grow',
                        type: 'number',
                        component: 'textFieldOptions',
                        state: createSignal('0'),
                        leftIcon: (
                            <button style={{border: 'none', background: 'transparent', cursor: 'pointer'}}>
                                <Icon icon="gg:scroll-v" style={{color: 'grey'}}/>
                            </button>
                        )
                    },
                    'FlexShrink': {
                        name: 'Flex Shrink',
                        label: 'Flex Shrink',
                        type: 'number',
                        component: 'textFieldOptions',
                        state: createSignal('0'),
                        leftIcon: (
                            <button style={{border: 'none', background: 'transparent', cursor: 'pointer'}}>
                                <Icon icon="gg:scroll-v" style={{color: 'grey'}}/>
                            </button>
                        )
                    },
                    'FlexBase': {
                        name: 'Flex Base',
                        label: 'Flex Base',
                        type: 'number',
                        component: 'textFieldOptions',
                        options: ['px'],
                        optionState: createSignal('%'),
                        state: createSignal('0'),
                        leftIcon: (
                            <button style={{border: 'none', background: 'transparent', cursor: 'pointer'}}>
                                <Icon icon="gg:scroll-v" style={{color: 'grey'}}/>
                            </button>
                        )
                    }
                }
        */

        return (
            <Container>
                {/*

                <div class={'b:1px|solid|#ccc r:5 p:5'}>
                    {JSON}
                    <For each={Object.entries(JSONSS)}>
                        {([name, value]) => <RenderComponent value={value}/>}
                    </For>
                </div>
*/}

                <Show when={props.isLabelOnTop} fallback={
                    <Show when={props.label} fallback={<Content/>}>
                        <CenterDiv>
                            <ContainerLabel title={props.label}/>
                            <Content/>
                        </CenterDiv>
                    </Show>
                }>
                    <div class={'w:full'}>
                        <ContainerLabel title={props.label}/>
                        <Content/>
                    </div>

                </Show>
            </Container>

        );
    };


    const ToggleButton = (props: {
        options: { key: JSX.Element; value: string }[],
        label: JSXElement,
        name: string,
        isLabelOnTop: boolean,
    }) => {
        const [cssState, setCssState] = useContext(CssEditorContext);
        const selected = () => cssState[props.name] ?? props.options[0].value;
        const isSelected = (option: any) => selected() === option.value;

        const Content = () => <div
            class={`inline-flex b:1px|solid|#ccc r:5 overflow:hidden ${!props.isLabelOnTop && props.label ? 'w:50%' : "w:100%"}`}>
            <For each={props.options}>
                {(option) => {
                    return <div
                        onClick={() => setCssState(props.name, option.value)}
                        class={`f:14 p:2|5 flex ai:center cursor:pointer w:-webkit-fill-available jc:center
                                     bg:${isSelected(option) ? '#e0e7f3' : 'transparent'}
                                      color:${isSelected(option) ? '#5252f1' : 'black'}
                                       r:${props.options.indexOf(option) === 0 ? '5|0|0|5' :
                            props.options.indexOf(option) === props.options.length - 1 ?
                                '0|5|5|0' : '0'}`}
                    >
                        {option.key}
                    </div>
                }}
            </For>
        </div>

        return (
            <Show when={props.isLabelOnTop} fallback={
                <Show when={props.label} fallback={<Content/>}>
                    <CenterDiv>
                        <ContainerLabel title={props.label}/>
                        <Content/>
                    </CenterDiv>
                </Show>
            }>
                <div class={'w:full'}>
                    <ContainerLabel title={props.label}/>
                    <Content/>
                </div>

            </Show>
        )

    };

    const DataEditor = (props: {
        label: any,
        name: string,
        openMenu: Accessor<any>,
        setOpenMenu: Setter<any>,
        centerComponent?: JSXElement,
        dialogLabel: any,
        children: any,
        fallback?: any,
    }) => {
        const [cssState, setCssState] = useContext(CssEditorContext);
        const addOption = () => {

            if (props.label.includes('Text Shadow')) {
                let currentOptions = cssState[props.name] ? cssState[props.name].split(',') : [];
                currentOptions.push('0|0|5px|black');
                const newValue = currentOptions.join(',');
                setCssState(props.name, newValue);
            } else if (props.label.includes('Filter')) {
                let currentOptions = cssState[props.name] ? cssState[props.name].split('|') : [];
                currentOptions.push('blur(3px)');
                const newValue = currentOptions.join('|');
                setCssState(props.name, newValue);
            } else if (props.label.includes('Box Shadow')) {
                let currentOptions = cssState[props.name] ? cssState[props.name].split(',') : [];
                currentOptions.push('0|0|5px|0|black');
                const newValue = currentOptions.join(',');
                setCssState(props.name, newValue);
            } else if (props.label.includes('Transition')) {
                let currentOptions = cssState[props.name] ? cssState[props.name].split(',') : [];
                currentOptions.push('opacity|1s|ease|0s');
                const newValue = currentOptions.join(',');
                setCssState(props.name, newValue);
            } else if (props.label.includes('Transform')) {
                let currentOptions = cssState[props.name] ? cssState[props.name].split('|') : [];
                currentOptions.push('rotate(10deg)');
                const newValue = currentOptions.join('|');
                setCssState(props.name, newValue);
            }


            // // Get the current value for the property
            // const currentOptions = cssState[props.name] ?? [];
            //
            // // Determine the new value based on the label
            // let newValue;
            // if (props.label.includes('Shadow')) {
            //     newValue = [...currentOptions, '0|0|5px|0|black'];
            //     setCssState(props.name, newValue.join(','));
            // } else if (props.label.includes('Filter')) {
            //     newValue = [...currentOptions, 'blur(3px)'];
            //     setCssState(props.name, newValue.join('|'));
            // } else if (props.label.includes('Transform')) {
            //     newValue = [...currentOptions, {value: 0, type: 'move x'}];
            //     setCssState(props.name, newValue.join('|'));
            // } else if (props.label.includes('Transition')) {
            //     newValue = [...currentOptions, {
            //         easing: 'ease-in',
            //         duration: 0,
            //         delay: 0,
            //         type: 'opacity'
            //     }];
            //     setCssState(props.name, newValue.join('|'));
            // }
        };

        const getOptions = () => {
            if (props.label.includes('Shadow') || props.label.includes('Transition')) {
                return (cssState[props.name] && cssState[props.name].split(',')) || []
            } else if (props.label.includes('Filter')) {
                return (cssState[props.name] && cssState[props.name].split('|')) || []
            } else if (props.label.includes('Transform')) {
                return (cssState[props.name] && cssState[props.name].split('|')) || []
            } else {
                return []
            }
        }

        const deleteOption = (index: number) => {
            if (props.label.includes('Shadow') || props.label.includes('Transition')) {
                const data = cssState[props.name].split(',').filter((_: any, i: any) => i !== index);
                setCssState(props.name, data.join(','));
            } else if (props.label.includes('Filter')) {
                const data = cssState[props.name].split('|').filter((_: any, i: any) => i !== index);
                setCssState(props.name, data.join('|'));
            } else if (props.label.includes('Transform')) {
                const data = cssState[props.name].split('|').filter((_: any, i: any) => i !== index);
                setCssState(props.name, data.join('|'));
            }

        };

        const openPopup = (index: number) => {
            props.setOpenMenu(index);
        };

        const closePopup = () => {
            props.setOpenMenu(null);
        };

        const renderPopup = (option: any, index: number) => {
            return (
                <Show when={props.openMenu() === index}>
                    <div style={{
                        position: 'absolute',
                        width: '280px',
                        "border-radius": "10px",
                        'background-color': '#fff',
                        border: '1px solid #ccc',
                        padding: '10px',
                        'margin-right': '100px',
                        'z-index': 1000
                    }} class={'popup'}>
                        <div class={'flex ai:center jc:space-between mb:5'}>
                            <div class={'f:15 font-weight:bold'}>
                                {props.dialogLabel}
                            </div>
                            <Icon onClick={closePopup} icon={'mdi:close'} style={{color: "grey"}}/>
                        </div>
                        <For each={Object.entries(props.children)}>
                            {([sectionName, properties], index) => (
                                <RenderComponent value={properties}/>
                            )}
                        </For>
                    </div>
                </Show>
            );
        };
        const handleClickOutside = (event: any) => {
            if (!event.target.closest('.popup')) {
                closePopup()
            }
        };

        // Attach event listener to the document
        createEffect(() => {
            document.addEventListener('mousedown', handleClickOutside);
            onCleanup(() => document.removeEventListener('mousedown', handleClickOutside));
        });

        const Component = (p: { option: any, i: any }) => {

            return <Switch>
                <Match when={props.label.includes('Shadow')}>
                    <span class={'f:14'} onClick={(e) => {
                        openPopup(p.i())
                    }} style={{
                        flex: '1',
                        'margin-right': '8px'
                    }}>{p.option.replaceAll('|', ' ')}</span>
                    <div class={`mr:10 h:20px bg:#fff w:20px r:5 box-shadow:${p.option}`}/>
                </Match>
                {props.label}
                <Match when={props.label.includes('Filter')}>
                    <span class={'f:14'} onClick={(e) => {
                        openPopup(p.i())
                    }} style={{
                        flex: '1',
                        'margin-right': '8px'
                    }}>{p.option.replaceAll(')', '').replaceAll('(', ' ')}</span>
                </Match>
                <Match when={props.label.includes('Transition')}>
                    <span class={'f:14'} onClick={(e) => {
                        openPopup(p.i())
                    }} style={{
                        flex: '1',
                        'margin-right': '8px'
                    }}>{p.option.replaceAll('|', ' ')}</span>
                </Match>
                <Match when={props.label.includes('Transform')}>
                    <span class={'f:14'} onClick={(e) => {
                        openPopup(p.i())
                    }} style={{
                        flex: '1',
                        'margin-right': '8px'
                    }}>{p.option.replaceAll(')', '').replaceAll('(', ' ')}</span>
                </Match>
                <Match when={true}>
                    {props.centerComponent}
                </Match>
            </Switch>
        }

        return (
            <div class={'b:1px|solid|lightgray r:5 p:.2rem|.3rem'} style={{
                position: 'relative',
                color: '#333',
                margin: '10px',
                "width": '-webkit-fill-available'
            }}>
                <div
                    class={`${getOptions().length > 0 ? 'bb:1|solid|lightgrey m:1 pb:5' : ''}`}
                    style={{
                        display: 'flex',
                        'justify-content': 'space-between',
                        'align-items': 'center',
                        'margin-bottom': '6px'
                    }}>
                    <ContainerLabel title={props.label}/>
                    <Icon class={'cursor:pointer'} onClick={addOption} icon={'lets-icons:add-round'}/>
                </div>
                <For each={getOptions()}>
                    {(option, i) => (
                        <div style={{
                            display: 'flex',
                            'align-items': 'center',
                            cursor: 'pointer',
                            "margin-bottom": '3px',
                            border: '1px solid #ccc',
                            padding: '5px',
                            'border-radius': '4px'
                        }}>
                            <Icon class={'cursor:pointer mr:8'} onClick={() => openPopup(i())}
                                  icon={'icon-park-outline:more-one'}/>
                            <Component option={option} i={i}/>
                            <Icon class={'cursor:pointer mr:8'} onClick={() => deleteOption(i())} icon={'mdi:close'}
                                  style={{color: "red"}}/>
                            {renderPopup(option, i())}
                        </div>

                    )}
                </For>
            </div>
        );
    };
    const FieldWithCustomProperty = (props: {
        label: string,
        name: string,
        component: string,
        isLabelOnTop: boolean,
        options: any,
        customProperty: any,
        gridType?: string,
        inputType?: string
    }) => {
        const [optionType, setOptionType] = createSignal('all')
        const [cssState, setCssState] = useContext(CssEditorContext);


        const onChangeAllField = () => {
            let newState = {...cssState};
            props.customProperty.forEach((property) => {
                newState[property.name] = cssState[props.name];
            });
            setCssState(newState);
        }

        return <div>
            <div style={{
                display: 'grid',
                'gap': '10px',
                'align-items': 'end',
                'grid-template-columns': '1fr 20%'
            }}>
                <RenderComponent value={{
                    name: props.name,
                    placeholder: '0',
                    isLabelOnTop: props.isLabelOnTop,
                    label: props.label,
                    onChangeInput: () => {
                        onChangeAllField()
                    },
                    component: props.inputType ?? 'textFieldOptions',
                    options: props.options,
                }
                }/>
                <ButtonGroups
                    isLabelOnTop={false}
                    name={'label'}
                    label={false}
                    onChange={() => {
                        if (optionType() === 'all') {
                            setOptionType('custom')
                        } else {
                            setOptionType('all')
                        }
                    }}
                    options={[
                        {
                            key: <AllSVGIcon/>, value: 'all', tooltip: 'all'
                        },
                        {
                            key: <CustomSVGIcon/>, value: 'custom', tooltip: 'custom'
                        },
                    ]}/>
            </div>
            <Show when={optionType() === 'custom'}>
                <div class={'b:1px|solid|lightgray p:0|10 pb:7 r:5 m:5|10'} style={{
                    display: 'grid',
                    'gap': '10px',
                    'align-items': 'end',
                    'grid-template-columns': props.gridType ?? 'repeat(2,auto)'
                }}>
                    <For each={props.customProperty}>
                        {(item) => {
                            return <RenderComponent value={{
                                name: item.name,
                                isLabelOnTop: props.isLabelOnTop,
                                placeholder: '0',
                                label:item.label,
                                component: props.inputType ?? 'textFieldOptions',
                                options: props.options,
                            }
                            }/>
                        }}
                    </For>
                </div>
            </Show>
        </div>
    }
    return {
        IconifyIcon,
        Container,
        ContainerLabel,
        DisplaySelector,
        ButtonGroups, FieldWithCustomProperty,
        TextFieldWithSelectOption, DataEditor, ColorPickerInput,
        CenterDiv,
        ToggleButton
    }
}

