import {For, Match, Show, Switch} from "solid-js";
import {StyleCSSComponents} from "./StyleCSSComponents";

export const RenderComponent = (props: { value: any }) => {
    const {
        DisplaySelector,
        ButtonGroups,
        DataEditor,
        ColorPickerInput,
        ToggleButton,
        TextFieldWithSelectOption
    } = StyleCSSComponents();
    return <Switch>
        <Match when={props.value.component === 'colorPicker'}>
            <ColorPickerInput
                label={props.value.label}
                isLabelOnTop={props.value.isLabelOnTop}
                color={props.value.state[0]}
                setColor={props.value.state[1]}
            />
        </Match>
        <Match when={props.value.component === 'select'}>
            <DisplaySelector
                name={props.value.name}
                label={props.value.label}
                isLabelOnTop={props.value.isLabelOnTop}
                options={props.value.options}
                selected={props.value.state[0]}
                setSelected={props.value.state[1]}/>
        </Match>
        <Match when={props.value.component === 'toggleButton'}>
            <ToggleButton
                isLabelOnTop={props.value.isLabelOnTop}
                label={props.value.label}
                setSelected={props.value.state[1]}
                selected={props.value.state[0]}
                options={props.value.options}/>
        </Match>
        <Match when={props.value.component === 'textField'}>
            <TextFieldWithSelectOption name={props.value.name} setInputValue={props.value.state[1]} isLabelOnTop={props.value.isLabelOnTop}
                                       label={props.value.label} inputValue={props.value.state[0]}
                                       inputType={props.value.type}/>

        </Match>
        <Match when={props.value.component === 'textFieldOptions'}>

            <TextFieldWithSelectOption name={props.value.name} showInside={true} leftIcon={props.value.leftIcon}
                                       isLabelOnTop={props.value.isLabelOnTop}
                                       label={props.value.label}
                                       setInputValue={props.value.state[1]}
                                       inputValue={props.value.state[0]}
                                       inputType={props.value.type} options={props.value.options}
                                       setOption={props.value.optionState[1]}
                                       selectedOption={props.value.optionState[0]}/>

        </Match>
        <Match when={props.value.component === 'grid'}>

            <div style={{
                padding: props.value['padding'] || 0,
                display: 'grid',
                gap: props.value['gap'] || 10,
                'align-items': props.value['align'] || 'center',
                'grid-template-columns': props.value['grid-template-columns']
            }}>
                <For each={props.value.children}>
                    {item => {
                        return <RenderComponent value={item}/>
                    }}
                </For>
            </div>
        </Match>
        <Match when={props.value.component === 'buttonGroups'}>
            <ButtonGroups
                isLabelOnTop={props.value.isLabelOnTop}
                name={props.value.name}
                label={props.value.label}
                selectedOption={props.value.state[0]}
                setSelectedOption={props.value.state[1]}
                options={props.value.options}/>
        </Match>
        <Match when={props.value.component === 'dataEditor'}>
            <DataEditor dialogLabel={props.value.dialogLabel} fallback={props.value.fallback}
                        centerComponent={props.value.centerComponent} children={props.value.children}
                        options={props.value.options[0]}
                        setOption={props.value.options[1]} openMenu={props.value.openMenu[0]}
                        setOpenMenu={props.value.openMenu[1]} label={props.value.label}/>
        </Match>
        <Match when={props.value.component === 'divider'}>
            <hr class={'w:full color:lightgrey m:5|0'}/>
            <Show  when={props.value.title}>
                <div class={'f:15'}>{props.value.title}</div>
            </Show>
        </Match>
        <Match when={true}>
            {JSON.stringify(props.value)}
        </Match>
    </Switch>
}