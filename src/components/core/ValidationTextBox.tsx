import { createEffect, For, Show } from "solid-js";

import TextBox, { Properties } from "devextreme/ui/text_box";
import Validator, { Properties as ValidatorProperties } from "devextreme/ui/validator";
import { NativeEventInfo } from "devextreme/events";
import { ComponentProps } from "./Form";
import { IdAttr } from "../../lib/graph";

export function ValidationTextInputField(props: ComponentProps) {
  return (
    <div aria-labelledby={props["aria-labeledby"]}>
      <div
        ref={(el) => {
          const instance = new TextBox(el, {
            onChange: (e: NativeEventInfo<TextBox, KeyboardEvent>) => {
              props.setValue(props.meta, e.component.option("value"));
            },
          });

          const validatorInstance = new Validator(el, {
            // validationRules: [{
            //     type: 'required',
            //     message: 'Email is required',
            //   }
            //   , {
            //     type: 'email',
            //     message: 'Email is invalid',
            //   },
            //   {
            //     type: 'async',
            //     message: 'Email is already registered',
            //     validationCallback(params) {
            //       return sendRequest(params.value);
            //     },
            //   }
            // ],
          });

          createEffect(() => instance.option("value", props.data.properties[props.meta.properties[IdAttr]]));

          createEffect(() => {
            for (const property in props.meta.properties.props as Properties) {
              instance.option(property, props.meta.properties.props[property]);
            }
          });
          createEffect(() => {
            for (const property in props.meta.properties.props as ValidatorProperties) {
              validatorInstance.option(property, props.meta.properties.props[property]);
            }
          });
        }}
      />


    </div>
  );
}
