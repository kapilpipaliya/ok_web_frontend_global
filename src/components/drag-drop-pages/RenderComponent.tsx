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
    const field = props.value;
    return <Switch>
        <Match when={field.component === 'colorPicker'}>
            <ColorPickerInput
                label={field.label}
                isLabelOnTop={field.isLabelOnTop}
                color={field.state[0]}
                setColor={field.state[1]}
            />
        </Match>
        <Match when={field.component === 'select'}>
            <DisplaySelector
                label={field.label}
                isLabelOnTop={field.isLabelOnTop}
                options={field.options}
                selected={field.state[0]}
                setSelected={field.state[1]}/>
        </Match>
        <Match when={field.component === 'toggleButton'}>
            <ToggleButton
                isLabelOnTop={field.isLabelOnTop}
                label={field.label}
                setSelected={field.state[1]}
                selected={field.state[0]}
                options={field.options}/>
        </Match>
        <Match when={field.component === 'textField'}>
            <TextFieldWithSelectOption setInputValue={field.state[1]} isLabelOnTop={field.isLabelOnTop}
                                       label={field.label} inputValue={field.state[0]}
                                       inputType={field.type}/>

        </Match>
        <Match when={field.component === 'textFieldOptions'}>

            <TextFieldWithSelectOption showInside={true} leftIcon={field.leftIcon}
                                       isLabelOnTop={field.isLabelOnTop}
                                       label={field.label}
                                       setInputValue={field.state[1]}
                                       inputValue={field.state[0]}
                                       inputType={field.type} options={field.options}
                                       setOption={field.optionState[1]}
                                       selectedOption={field.optionState[0]}/>

        </Match>
        <Match when={field.component === 'grid'}>

            <div style={{
                padding: field['padding'] || 0,
                display: 'grid',
                gap: field['gap'] || 10,
                'align-items': field['align'] || 'center',
                'grid-template-columns': field['grid-template-columns']
            }}>
                <For each={field.children}>
                    {item => {
                        return <RenderComponent value={item}/>
                    }}
                </For>
            </div>
        </Match>
        <Match when={field.component === 'buttonGroups'}>
            <ButtonGroups
                isLabelOnTop={field.isLabelOnTop}
                name={field.name}
                label={field.label}
                selectedOption={field.state[0]}
                setSelectedOption={field.state[1]}
                options={field.options}/>
        </Match>
        <Match when={field.component === 'dataEditor'}>
            <DataEditor dialogLabel={field.dialogLabel} fallback={field.fallback}
                        centerComponent={field.centerComponent} children={field.children}
                        options={field.options[0]}
                        setOption={field.options[1]} openMenu={field.openMenu[0]}
                        setOpenMenu={field.openMenu[1]} label={field.label}/>
        </Match>
        <Match when={field.component === 'divider'}>
            <hr class={'w:full color:lightgrey m:5|0'}/>
            <Show  when={field.title}>
                <div class={'f:15'}>{field.title}</div>
            </Show>
        </Match>
        <Match when={true}>
            {JSON.stringify(field)}
        </Match>
    </Switch>
}