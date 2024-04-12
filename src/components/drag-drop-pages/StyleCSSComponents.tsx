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
    Show, splitProps,
    Switch
} from "solid-js";
import {TextField} from "../solid-blocks/blocks";
import {RenderComponent} from "./RenderComponent";

export const StyleCSSComponents = () => {
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
        options: { key: any, value: string }[] | string[],
        isLabelOnTop: boolean,
        label: string,
        selected: Accessor<string>,
        setSelected: Setter<string>,
    }) => {

        const Content = () => <div class={`w:${!props.isLabelOnTop ? "50%" : '100%'}`}>
            <select
                value={props.selected() || props.options[0]}
                onInput={(e) => props.setSelected(e.currentTarget.value)}
                class={`ui search dropdown w:100% p:5 b:1px|solid|#ccc r:5 f:14 appearance:none bg:white`}
            >
                <For each={props.options}>
                    {(option) =>
                        <option
                            value={option.key ?? option}>{option.value ? option.value.charAt(0).toUpperCase() + option.value.slice(1) : option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                    }
                </For>
            </select>
            <span style={{position: 'relative'}}>
                <Icon
                    icon={'icon-park-outline:down'}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'grey'
                    }}
                />
            </span>
        </div>;

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
    }

    const ColorPickerInput = (props: {
        color: Accessor<any>,
        setColor: Setter<any>,
        isLabelOnTop: boolean,
        label: any
    }) => {
        const handleChange = (event) => {
            props.setColor(event.target.value);
        };

        const Content = () => <div class="flex ai:center b:1px|solid|lightgrey p:5 r:5">
            <input
                type="color"
                class="color-picker__input-color mr:10 cursor:pointer; h:25px w:30px r:5 p:0 bg:#ffffff b:none"
                value={props.color()}
                onInput={handleChange}
            />
            <input
                type="text"
                class="b:none w:100% f:14 outline:none"
                value={props.color()}
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
        options: { key: JSX.Element; value: string }[],
        name: string,
        selectedOption: Accessor<string>,
        setSelectedOption: Setter<string>,
        showIcon?: boolean,
        label: any,
        isLabelOnTop: boolean,
        onIconClick?: any,
        radioInputStyle?: JSX.CSSProperties,
        radioStyle?: JSX.CSSProperties,
        inputStyle?: JSX.CSSProperties,
        nameStyle?: JSX.CSSProperties
        labelClass?: string
    }) => {

        const handleChange = (option: { key: JSX.Element; value: string }) => {
            props.setSelectedOption(option.value);
        };

        const Content = () => <div class={`radio-inputs w:100%`} style={props.radioInputStyle}>
            <For each={props.options}>
                {(option, index) => {
                    return <label class={`radio`} style={props.radioStyle}>
                        {/*<Tooltip content={option.value}>*/}
                        <input
                            type="radio"
                            name={props.name}
                            style={props.inputStyle}
                            checked={props.selectedOption() === option.value}
                            onChange={() => handleChange(option)}
                        />
                        <span class={`name`} style={props.nameStyle}>{option.key}</span>
                        {/*</Tooltip>*/}
                    </label>
                }}
            </For>
        </div>

        return <Show when={props.isLabelOnTop} fallback={
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
    };
    const CenterDiv = (props: { children: JSXElement }) => <div
        class={'w:full flex ai:center jc:space-between'}>{props.children}</div>;

    const TextFieldWithSelectOption = (props: {
        inputValue: Accessor<string>,
        setInputValue: Setter<string>,
        options?: string[],
        selectedOption?: Accessor<string>,
        setOption?: Setter<string>,
        leftIcon?: JSXElement,
        isLabelOnTop?: boolean,
        label?: string,
        showInside?: boolean,
        inputType?: string,
        placeholder?: string
    }) => {
        const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);

        const toggleDropdown = (event: any) => {
            event.stopPropagation(); // Prevent click from immediately closing the dropdown
            setIsDropdownOpen(!isDropdownOpen());
        };

        const selectOption = (option: string) => {
            setIsDropdownOpen(false);
            if (props.setOption) props.setOption(option); // Check if the handler is provided
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
                    placeholder={props.placeholder}
                    value={props.inputValue()}
                    onInput={(e) => props.setInputValue(e.target.value)}
                    class={`f:14`}
                    style={{width: '100%'}} // Set width to 100%
                />}>
                    <input
                        type={props.inputType || 'text'}
                        placeholder={props.placeholder}
                        value={props.inputValue()}
                        onInput={(e) => props.setInputValue(e.target.value)}
                        class={`f:14 outline:none p:5`}
                        style={{width: '100%'}} // Set width to 100%
                    />
                </Show>
            </div>
            <Show when={props.options}>
                <span onClick={toggleDropdown}
                      class={'color:lightgrey f:14 ml:5 pr:5 cursor:pointer user-select:none'}>{props.selectedOption!()}</span>
                <Show when={isDropdownOpen()}>
                    <div
                        class={`bg:white w:full box-shadow:0px|2px|5px|rgba(0,0,0,0.2) r:5 p:5 abs z-index:1000 top:100% left:0`}>
                        <For each={props.options}>{(option) => (
                            <div onClick={() => selectOption(option)}
                                 class={`flex ai:center jc:space-between p:5 cursor:pointer bg:#efefef:hover ${props.selectedOption!() === option ? 'bg:rgb(229,234,253) font-weight:medium' : 'bg:transparent'} r:5`}>
                                {option}
                                <Show when={props.selectedOption!() === option}>
                                    <Icon icon={'mdi:check'}/>
                                </Show>
                            </div>
                        )}</For>
                    </div>
                </Show>
            </Show>
        </div>

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
        isLabelOnTop: boolean,
        selected: Accessor<string>,
        setSelected: Setter<string>,
        divClass?: string,
        optionClass?: string
        labelClass?: string
    }) => {
        const isSelected = (option: any) => props.selected() === option.value;

        const Content = () => <div
            class={`inline-flex b:1px|solid|#ccc r:5 overflow:hidden ${props.divClass} ${!props.isLabelOnTop && props.label ? 'w:50%' : "w:100%"}`}>
            <For each={props.options}>
                {(option) => {
                    return <div
                        onClick={() => props.setSelected(option.value)}
                        class={`f:14 p:2|5 flex ai:center cursor:pointer w:-webkit-fill-available jc:center
                                     bg:${isSelected(option) ? '#e0e7f3' : 'transparent'}
                                      color:${isSelected(option) ? '#5252f1' : 'black'}
                                       r:${props.options.indexOf(option) === 0 ? '5|0|0|5' :
                            props.options.indexOf(option) === props.options.length - 1 ?
                                '0|5|5|0' : '0'} ${props.optionClass}`}
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
        openMenu: Accessor<any>,
        setOpenMenu: Setter<any>,
        options: Accessor<any>,
        setOption: Setter<any>,
        centerComponent?: JSXElement,
        dialogLabel: any,
        children: any,
        fallback?: any,
    }) => {
        const addOption = () => {
            if (props.label.includes('Shadow')) {
                props.setOption([...props.options(), {x: 0, y: 0, blur: 5, spread: 0, color: 'black', style: ''}]);
            } else if (props.label.includes('Filter')) {
                props.setOption([...props.options(), {value: 0, type: 'blur'}]);
            } else if (props.label.includes('Transform')) {
                props.setOption([...props.options(), {value: 0, type: 'move x'}]);
            } else if (props.label.includes('Transition')) {
                props.setOption([...props.options(), {easing: 'ease-in', duration: 0, delay: 0, type: 'opacity'}]);
            }
        };

        const deleteOption = (index: number) => {
            props.setOption(props.options().filter((_: any, i: any) => i !== index));
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
            console.log(props.label)
            return <Switch>
                <Match when={props.label.includes('Shadow')}>
                    <span class={'f:14'} onClick={(e) => {
                        openPopup(p.i())
                    }} style={{
                        flex: '1',
                        'margin-right': '8px'
                    }}>{`${p.option.x}px ${p.option.y} ${p.option.blur}px ${p.option.spread}`}</span>
                    <div class={'mr:10 h:20px bg:#fff w:20px r:5'}
                         style={{'box-shadow': `${p.option.x}px ${p.option.y}px ${p.option.blur}px ${p.option.color} ${p.option.style}`}}/>
                </Match>
                {props.label}
                <Match when={props.label.includes('Filter')}>
                    <span class={'f:14'} onClick={(e) => {
                        openPopup(p.i())
                    }} style={{
                        flex: '1',
                        'margin-right': '8px'
                    }}>{`${p.option.value}px ${p.option.type}`}</span>
                </Match>
                <Match when={props.label.includes('Transition')}>
                    <span class={'f:14'} onClick={(e) => {
                        openPopup(p.i())
                    }} style={{
                        flex: '1',
                        'margin-right': '8px'
                    }}>{`${p.option.type}: ${p.option.duration}s`}</span>
                </Match>
                <Match when={props.label.includes('Transform')}>
                    <span class={'f:14'} onClick={(e) => {
                        openPopup(p.i())
                    }} style={{
                        flex: '1',
                        'margin-right': '8px'
                    }}>{`${p.option.type}: ${p.option.value}px`}</span>
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
                <div class={`${props.options().length > 0 ? 'bb:1|solid|lightgrey m:1 pb:5' : ''}`} style={{
                    display: 'flex',
                    'justify-content': 'space-between',
                    'align-items': 'center',
                    'margin-bottom': '6px'
                }}>
                    <ContainerLabel title={props.label}/>
                    <Icon class={'cursor:pointer'} onClick={addOption} icon={'lets-icons:add-round'}/>
                </div>
                <For each={props.options()}>
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

    return {
        IconifyIcon,
        Container,
        ContainerLabel,
        DisplaySelector,
        ButtonGroups,
        TextFieldWithSelectOption, DataEditor, ColorPickerInput,
        CenterDiv,
        ToggleButton
    }
}

