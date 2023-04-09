import { createEffect } from "solid-js";

import CheckBox, { Properties } from "devextreme/ui/check_box";
import Validator, {
  Properties as ValidatorProperties,
} from "devextreme/ui/validator";
import { ComponentProps } from "./Form";

export function ValidationBooleanInputField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new CheckBox(el, {
            // value: false,
            onValueChanged: (e) => {
              props.setValue(props.meta, e.value);
              // props.setValue((e.event?.currentTarget as HTMLInputElement).checked);
            },
          });

          const validatorInstance = new Validator(el, {
            // validationRules: [
            //   {
            //     type: "required"
            //   }
            // ],
          });

            createEffect(() =>
              instance.option(
                "value",
                props.data.properties[props.meta.properties.id]
              )
            );
          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              instance.option(property, props.meta.properties.props[property]);
            }
          });
          createEffect(() => {
            instance.option(
              "validationStatus",
              props.errors ? "invalid" : "valid"
            );
          });
          createEffect(() => {
            if (props.errors) {
              instance.option(
                "validationErrors",
                props.errors.map((error: string) => {
                  error;
                })
              );
            } else {
              instance.option("validationErrors", undefined);
            }
          });

          createEffect(() => {
            for (const property in props.meta.properties
              .props as ValidatorProperties) {
              if (property === "validationRules") {
                const validations = props.meta.properties.props.validationRules;
                const validationRules = [];
                for (const rule of validations) {
                  validationRules.push({
                    type: rule,
                  });
                }
                validatorInstance.option("validationRules", validationRules);
              } else {
                validatorInstance.option(
                  property,
                  props.meta.properties.props[property]
                );
              }
            }
          });
        }}
      />
    </div>
  );
}
