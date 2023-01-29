import { createEffect, splitProps } from "solid-js";
import { IFormControl } from "solid-forms";
import CheckBox, { Properties } from "devextreme/ui/check_box";

export interface BooleanInputFieldProps extends Properties {
  control: IFormControl;
}

export function BooleanInputField(props: BooleanInputFieldProps) {
  const [p, customProps] = splitProps(props, ["control"]);

  return (
    <div
      classList={{
        "is-invalid": !!p.control.errors,
        "is-touched": p.control.isTouched,
        "is-required": p.control.isRequired,
        "is-disabled": p.control.isDisabled
      }}
    >
      <div ref={el => {
        const instance = new CheckBox(el, {
          ...customProps,
          value: p.control.value,
          onValueChanged: (e) => {
            p.control.setValue(e.value);
            // p.control.setValue((e.event?.currentTarget as HTMLInputElement).checked);
          },
          onOptionChanged: () => p.control.markTouched(true),
          // required: p.control.isRequired,
          disabled: p.control.isDisabled || p.control.isReadonly
        });
        createEffect(() => {
          instance.option("validationStatus", p.control.errors ? "invalid" : "valid");
        });
        createEffect(() => {
          if (p.control.isTouched && !p.control.isValid && p.control.errors) {
            instance.option("validationErrors", p.control.errors.map((error: string) => {error}));
          } else {
            instance.option("validationErrors", undefined);
          }
        });
      }} />
    </div>
  );
}
