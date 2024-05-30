import { For, useContext } from "solid-js";
import { DynamicCSSComponent } from "~/components/dynamic/components/DynamicCssComponent";
import { FormSettingsContext } from "~/lib/contexts";
const createSelectOptions = (name: string, label: string, options: any[], isLabelOnTop = false, onChangeInput?: any) => ({
    name,
    label,
    component: "select",
    options,
    isLabelOnTop,
    onChangeInput,
});
export const FormSetting = () => {
    const [formSettingContext,setFormSettingContext] = useContext(FormSettingsContext)
    const properties = {
        labelPosition: createSelectOptions("labelPosition", "Label Align", ["left", "right", "top", "bottom"], false, (k,v) => {
            onChangeInput(k,v)
        }),
    }
    const onChangeInput = (label:any,value:any) => {
        setFormSettingContext(label,value)
    }
    return <div>
        <For each={Object.entries(properties)}>
            {([name, value]) => <DynamicCSSComponent value={value} />}
        </For>
    </div>;
}


