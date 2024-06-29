import { For } from "solid-js";
import { DynamicCSSComponent } from "~/components/css_properties/components/DynamicCssComponent";
import { useDesignerLayoutStore } from "../LayoutContext";
const createSelectOptions = (
  name: string,
  label: string,
  options: any[],
  isLabelOnTop = false,
  onChangeInput?: any,
) => ({
  name,
  label,
  component: "select",
  options,
  isLabelOnTop,
  onChangeInput,
});
export const FormSetting = () => {
  const [_, setLayoutStore] = useDesignerLayoutStore();
  const properties = {
    labelPosition: createSelectOptions(
      "labelPosition",
      "Label Align",
      ["left", "right", "top", "bottom"],
      false,
      (k, v) => {
        onChangeInput(k, v);
      },
    ),
  };
  const onChangeInput = (label: any, value: any) => {
    setLayoutStore(label, value);
  };
  return (
    <div>
      <For each={Object.entries(properties)}>
        {([name, value]) => <DynamicCSSComponent value={value} />}
      </For>
    </div>
  );
};
