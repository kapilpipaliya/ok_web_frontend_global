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
import {TextField} from "./solid-blocks/blocks";
import {RenderComponent} from "./RenderComponent";

export const StyleCSSComponents = () => {
    const IconifyIcon = (props: IconifyIconProps) => {
        const [selected, restProps] = splitProps(props,['icon', 'height', 'width']);
        return <Icon icon={selected.icon} height={selected.height ?? 23} width={selected.width ?? 23} {...restProps} />;
    };

    const ContainerLabel =
        (props: { title: JSXElement, showIcon?: boolean, onIconClick?: any, class?: any }) => <span
            class={`flex ai:center m:0 font:15px font-weight:500 ${props.class}`}>{props.title}<Show
            when={props.showIcon ?? false}>
            &nbsp;<Icon onClick={props.onIconClick} icon={'mdi:close'} class={'cursor:pointer'}/></Show></span>

    const Container =
        (props: {class?: string, children: JSXElement}) => <span
            class={`w:full min-h:45px flex ai:center jc:space-between flex-shrink:0 ${props.class}`}>{props.children}</span>


    const DisplaySelector = (props: {
        options: {key: any, value: string}[] | string[],
        title: string,
        selected: Accessor<string>,
        setSelected: Setter<string>,
        selectorDivClass?: string
        selectorClass?: string
        labelClass?: string
    }) => {

        return (
            <div class={`position:relative flex ai:center jc:space-between ${props.selectorDivClass}`}>
                <ContainerLabel title={props.title} class={`mt:1rem mb:1rem ${props.labelClass}`}/>
                <select
                    value={props.selected() || props.options[0]}
                    onInput={(e) => props.setSelected(e.currentTarget.value)}
                    class={`ui search dropdown min-w:150px p:5 b:1px|solid|#ccc r:5 f:14 appearance:none bg:white ${props.selectorClass}`}
                >
                    <For each={props.options}>
                        {(option) =>
                            <option
                                value={option.key ?? option}>{option.value ? option.value.charAt(0).toUpperCase() + option.value.slice(1) : option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                        }
                    </For>
                </select>
                <span style={{position: 'absolute', right: '10px', top: '17px', color: 'grey'}}><Icon
                    icon={'icon-park-outline:down'}/></span>
            </div>
        );
    }

    const ButtonGroups = (props: {
        options: { key: JSX.Element; value: string }[],
        name: string,
        selectedOption: Accessor<string>,
        setSelectedOption: Setter<string>,
        showIcon?: boolean,
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

        return <>
            <ContainerLabel showIcon={props.showIcon} onIconClick={props.onIconClick} title={props.name}
                            class={`mt:1rem mb:.2rem ${props.labelClass}`}/>
            <div class={`radio-inputs`} style={props.radioInputStyle}>
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
        </>
    };
    const CenterDiv = (props: {children: JSXElement}) => <div class={'w:full flex ai:center jc:space-between'}>{props.children}</div>;

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
                <Show when={props.leftIcon}>
                    <div class={'pt:3'}>
                        {props.leftIcon}
                    </div>
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
                                {option}<Show when={props.selectedOption!() === option}>
                                <Icon icon={'mdi:check'}/>
                            </Show>
                            </div>
                        )}</For>
                    </div>
                </Show>
            </Show>
        </div>

        return (
            <Container>

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
        selected: Accessor<string>,
        setSelected: Setter<string>,
        divClass?: string,
        optionClass?: string
        labelClass?: string
    }) => {
        const isSelected = (option: any) => props.selected() === option.value;

        return (
            <Container>
                <CenterDiv>
                    <Show when={props.label}>
                        <ContainerLabel title={props.label} class={`mb:.2rem ${props.labelClass}`}/>
                    </Show>
                    <div
                        class={`inline-flex b:1px|solid|#ccc r:5 overflow:hidden ${props.divClass} w:inherit ${props.label ? 'max-width:50%' : ""}`}>
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
                </CenterDiv>
            </Container>
        );
    };

    const DataEditor = (props: {
        label: any,
        openMenu: Accessor<any>,
        setOpenMenu: Setter<any>,
        option: Accessor<any>,
        setOption: Setter<any>,
        centerComponent?: JSXElement,
        dialogLabel: any,
        children: any,
        fallback?: any,
    }) => {
        const addOption = () => {
            props.setOption([...props.option(), {x: 0, y: 0, blur: 5, spread: 0, color: 'black', style: ''}]);
        };

        const deleteOption = (index: number) => {
            props.setOption(props.option().filter((_: any, i: any) => i !== index));
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
                        width: '250px',
                        "border-radius": "10px",
                        'background-color': '#fff',
                        border: '1px solid #ccc',
                        padding: '10px',
                        'margin-right': '100px',
                        'z-index': 1000
                    }} class={'popup'}>
                        <div class={'flex ai:center jc:space-between mb:5'}>
                            <div class={'f:15 font-weight:bold'}>Box Shadow</div>
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
                    <span onClick={(e) => {
                        openPopup(p.i())
                    }} style={{
                        flex: '1',
                        'margin-right': '8px'
                    }}>{`${p.option.x}px ${p.option.y} ${p.option.blur}px ${p.option.spread}`}</span>
                    <div class={'mr:10 h:20px bg:#fff w:20px r:5'}
                         style={{'box-shadow': `${p.option.x}px ${p.option.y}px ${p.option.blur}px ${p.option.color} ${p.option.style}`}}/>
                </Match>
                <Match when={true}>
                    {props.centerComponent}
                </Match>
            </Switch>
        }

        return (
            <div style={{
                position: 'relative',
                color: '#333',
                margin: '10px',
                "width": '-webkit-fill-available'
            }}>
                <div style={{
                    display: 'flex',
                    'justify-content': 'space-between',
                    'align-items': 'center',
                    'margin-bottom': '10px'
                }}>
                    <ContainerLabel title={props.dialogLabel}/>
                    <Icon class={'cursor:pointer'} onClick={addOption} icon={'lets-icons:add-round'}/>
                </div>
                <For each={props.option()} fallback={props.fallback}>
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
                            <Icon class={'cursor:pointer mr:8'} onClick={() => deleteOption(i())} icon={'mdi:close'}/>
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
        TextFieldWithSelectOption, DataEditor,
        CenterDiv,
        ToggleButton
    }
}

