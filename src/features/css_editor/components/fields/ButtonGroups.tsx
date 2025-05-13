import { Icon } from "@iconify-icon/solid";
import { For, type JSX, splitProps } from "solid-js";

import type { ButtonGroupField } from "../../constants/FieldSchemaType";
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import { TooltipWrapper } from "~/components/styled/modal/TooltipWrapper";

export const ButtonGroups = (props: Readonly<ButtonGroupField>) => {
  const [local, _others] = splitProps(props, ["componentName", "onChange"]);
  const handleChange = (
    _e: Event,
    option: { key: JSX.Element; value: string },
  ) => {
    local.onChange?.(option.value);
  };

  return (
    <As
      as="div"
      css={(args) => css`
        display: flex;
        border: 1px solid ${args.theme.var.color.secondary};
        box-shadow: 0 0 0px 1px ${args.theme.var.color.secondary};
        box-sizing: border-box;
        font-size: 14px;
        flex-wrap: wrap;
        min-width: max-content;
        border-radius: 0.3rem;
        width: 100%;
      `}
    >
      <For each={props.options}>
        {(option) => {
          return (
            <As as="label" css={css`flex: 1; text-align: center;`}>
              <TooltipWrapper
                openDelay={200}
                triggerAs="span"
                triggerCss={css`transform: translateY(0.125rem);`}
                content={
                  <As
                    as="div"
                    css={css`
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      background: #333;
                      color: white;
                      font-size: 13px;
                      font-family: poppins;
                      font-weight: 300;
                      max-width: fit-content;
                      min-width: fit-content;
                      padding: 3px 10px;
                      border-radius: 5px;
                      text-wrap: nowrap;
                      width: 100%;
                      z-index: 1;
                    `}
                  >
                    {option.tooltip ?? option.value}
                  </As>
                }
                contentCss={(args) => [
                  css`
                  border-radius: 8px;
                  background: ${args.theme.var.color.base_10};
                  padding: 8px 12px;
                  font-weight: 500;
                  &[data-state='open'] {
                    animation: in 200ms ease-out;
                  }
                  &[data-state='closed'] {
                    animation: out 200ms ease-in;
                  }
                  
                `,
                  `@keyframes in {
                    from {
                      opacity: 0;
                      transform: translateY(4px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                  @keyframes out {
                    from {
                      opacity: 1;
                      transform: translateY(0);
                    }
                    to {
                      opacity: 0;
                      transform: translateY(4px);
                    }
                  }`,
                ]}
              >
                <As
                  as="input"
                  checked={props.value === option.value}
                  css={css`display: none;`}
                  name={props.key}
                  onChange={(e) => handleChange(e, option)}
                  type="radio"
                />
                <As
                  as="span"
                  css={(args) => css`
                    ${
                      props.value === option.value
                        ? `
                        border-bottom: 1px solid ${args.theme.var.color.primary};
                        color: ${args.theme.var.color.primary};
                        font-weight: 500;
                      `
                        : ""
                    }
                    display: flex;
                    align-items: center;
                    border: none;
                    cursor: pointer;
                    justify-content: center;
                    padding: 4px;
                    color: ${args.theme.var.color.secondary};
                    transition: all 0.15s ease-in-out;
                  `}
                >
                  {option.icon ? (
                    <Icon
                      height={23}
                      icon={option.icon}
                      noobserver
                      width={23}
                    />
                  ) : (
                    option.key
                  )}
                </As>
              </TooltipWrapper>
            </As>
          );
        }}
      </For>
    </As>
  );
};
