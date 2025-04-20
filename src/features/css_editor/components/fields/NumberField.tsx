import { splitProps } from "solid-js";
import { As } from "~/components/As";

import { PROPERTIES } from "~/pages/settings/constants";

export const NumberField = (props: any) => {
  const [local, others] = splitProps(props, ["onChange"]);

  const handleChange = (event: Event) => {
    event.stopPropagation;
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;

    const targetValue = target.value.trim;
    if (targetValue === "") {
      local.onChange?.("");
    } else {
      const parsedValue = Number.parseFloat(targetValue);
      local.onChange?.(isNaN(parsedValue) ? "" : (parsedValue as any));
    }

    // Force the input value to update the props.value,
    // In SolidJs when the component prop value is not changed, its value is not updated,
    // so input field display incorrect value, because the value is not updated.
    // this will fix the issue.
    if (props.value !== target.value) {
      target.value = props.value ?? "";
    }
  };

  return (
    <As as="input"
      css={[PROPERTIES.Css.TextFieldCss]}
      type="number"
      {...others}
      onChange={handleChange}
    />
  );
};
