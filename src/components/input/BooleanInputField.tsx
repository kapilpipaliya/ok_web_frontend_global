import { createEffect, splitProps } from "solid-js";

import CheckBox, { Properties } from "devextreme/ui/check_box";

export interface BooleanInputFieldProps extends Properties {
  required?: boolean;
  errors?: string[];
  setValue: (value: string) => void;
  "aria-labeledby"?: string
}

export function BooleanInputField(props: BooleanInputFieldProps) {
  const [p, customProps] = splitProps(props, ["aria-labeledby"]);

  return (
    <div aria-labeledby={p["aria-labeledby"]}>
      <div ref={el => {
        const instance = new CheckBox(el, {
          ...customProps,
          value: props.value,
          enableThreeStateBehavior: true,
          onValueChanged: (e) => {
            props.setValue(e.value);
            // props.setValue((e.event?.currentTarget as HTMLInputElement).checked);
          },
          // required: props.required,
          disabled: props.disabled
        });
        createEffect(() => {
          instance.option("validationStatus", props.errors ? "invalid" : "valid");
        });
        createEffect(() => {
          if (props.errors) {
            instance.option("validationErrors", props.errors.map((error: string) => {error}));
          } else {
            instance.option("validationErrors", undefined);
          }
        });
      }} />
    </div>
  );
}
