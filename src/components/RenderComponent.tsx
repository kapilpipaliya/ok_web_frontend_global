import {For, Match, Switch} from "solid-js";
import {StyleCSSComponents} from "./StyleCSSComponents";

export const RenderComponent = (props: { value: any }) => {
    const {
        DisplaySelector,
        ButtonGroups,
        DataEditor,
        ToggleButton,
        TextFieldWithSelectOption
    } = StyleCSSComponents();
    const field = props.value;
    return <Switch>
        <Match when={field.component === 'select'}>
            <DisplaySelector
                title={field.label}
                options={field.options}
                selected={field.state[0]}
                setSelected={field.state[1]}/>
        </Match>
        <Match when={field.component === 'toggleButton'}>
            <ToggleButton
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
                                       inputType={field.type} options={field.option}
                                       setOption={field.optionState[1]}
                                       selectedOption={field.optionState[0]}/>

        </Match>
        <Match when={field.component === 'grid'}>
            <div style={{display: 'grid', gap: '10px', 'grid-template-columns': field['grid-template-columns']}}>
                <For each={field.children}>
                    {item => {
                        return <RenderComponent value={item}/>
                    }}
                </For>
            </div>
        </Match>
        <Match when={field.component === 'buttonGroups'}>
            <ButtonGroups
                name={field.label}
                selectedOption={field.state[0]}
                setSelectedOption={field.state[1]}
                options={field.options}/>
        </Match>
        <Match when={field.component === 'dataEditor'}>
            <DataEditor dialogLabel={field.dialogLabel} fallback={field.fallback}
                        centerComponent={field.centerComponent} children={field.children}
                        option={field.option[0]}
                        setOption={field.option[1]} openMenu={field.openMenu[0]}
                        setOpenMenu={field.openMenu[1]} label={field.label}/>
        </Match>
        <Match when={true}>
            Not Component Found
        </Match>
    </Switch>
}