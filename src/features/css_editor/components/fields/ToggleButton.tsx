import { Icon } from "@iconify-icon/solid";
import { For, splitProps } from "solid-js";
import { As } from "../../../../components/As";

import type { ToggleField } from "../../constants/FieldSchemaType";

export const ToggleButton = (props: Readonly<ToggleField>) => {
  const [local, _others] = splitProps(props, ["componentName", "onChange"]);

  const isSelected = (option: any) => props.value === option.value;

  return (
    <As
      as="div"
      css={`
        display: inline-flex;
        border: 1px solid #ccc;
        overflow: hidden;
        border-radius: 5px;
        width: ${!props.isLabelOnTop && props.label ? "50%" : "100%"};
      `}
    >
      <For each={props.options}>
        {(option) => {
          return (
            <As
              as="div"
              css={`
                display: flex;
                align-items: center;
                background: ${isSelected(option) ? "#e0e7f3" : "transparent"};
                color: ${isSelected(option) ? "#5252f1" : "black"};
                cursor: pointer;
                font-size: 14px;
                justify-content: center;
                padding: 2px 5px;
                border-radius: ${
                  props.options.indexOf(option) === 0
                    ? "5px 0 0 5px"
                    : props.options.indexOf(option) === props.options.length - 1
                      ? "0 5px 5px 0"
                      : "0"
                };
                width: -webkit-fill-available;
              `}
              onClick={() => {
                local.onChange?.(option.value);
              }}
            >
              {option.icon ? (
                <Icon height={23} icon={option.icon} noobserver width={23} />
              ) : (
                option.key
              )}
            </As>
          );
        }}
      </For>
    </As>
  );
};
