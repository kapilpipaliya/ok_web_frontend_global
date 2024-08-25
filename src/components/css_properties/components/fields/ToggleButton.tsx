import { Icon } from "@iconify-icon/solid";
import { For, splitProps } from "solid-js";

import type { ToggleField } from "../../constants/FieldSchemaType";

export const ToggleButton = (props: Readonly<ToggleField>) => {
  const [local, _others] = splitProps(props, ["componentName", "onChange"]);

  const isSelected = (option: any) => props.value === option.value;

  return (
    <div
      class={`${
        !props.isLabelOnTop && props.label ? "w:50%" : "w:100%"
      } inline-flex b:1px|solid|#ccc overflow:hidden r:5`}
    >
      <For each={props.options}>
        {(option) => {
          return (
            <div // NOSONAR
              class={`flex ai:center bg:${
                isSelected(option) ? "#e0e7f3" : "transparent"
              } color:${isSelected(option) ? "#5252f1" : "black"} cursor:pointer f:14 jc:center p:2|5
                 r:${
                   props.options.indexOf(option) === 0
                     ? "5|0|0|5"
                     : props.options.indexOf(option) ===
                         props.options.length - 1
                       ? "0|5|5|0"
                       : "0"
                 }
                 w:-webkit-fill-available`}
              onClick={() => {
                local.onChange?.(option.value);
              }}
            >
              {option.icon ? (
                <Icon height={23} icon={option.icon} width={23} />
              ) : (
                option.key
              )}
            </div>
          );
        }}
      </For>
    </div>
  );
};
