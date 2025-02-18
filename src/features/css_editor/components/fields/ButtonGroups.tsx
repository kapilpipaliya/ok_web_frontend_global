import { Icon } from "@iconify-icon/solid";
import { clientOnly } from "@solidjs/start";
import { For, type JSX, splitProps } from "solid-js";

const Tooltip = clientOnly(() => import("~/components/ssr/tooltip/Tooltip"));
const TooltipTrigger = clientOnly(
  () => import("~/components/ssr/tooltip/TooltipTrigger"),
);
const TooltipPortal = clientOnly(
  () => import("~/components/ssr/tooltip/TooltipPortal"),
);
const TooltipContent = clientOnly(
  () => import("~/components/ssr/tooltip/TooltipContent"),
);
const TooltipArrow = clientOnly(
  () => import("~/components/ssr/tooltip/TooltipArrow"),
);

import type { ButtonGroupField } from "../../constants/FieldSchemaType";

export const ButtonGroups = (props: Readonly<ButtonGroupField>) => {
  const [local, _others] = splitProps(props, ["componentName", "onChange"]);
  const handleChange = (
    _e: Event,
    option: { key: JSX.Element; value: string },
  ) => {
    local.onChange?.(option.value);
  };

  return (
    <div class="flex border:1px|solid|secondary box-shadow:0|0|0px|1px|secondary box:border f:14px flex:wrap min-w:max r:0.3rem w:100%">
      <For each={props.options}>
        {(option) => {
          return (
            <label class="flex:1 text:center">
              <Tooltip
                floatingOptions={{
                  flip: true,
                  offset: 13,
                  shift: true,
                }}
                openDelay={200}
                placement="top"
              >
                <TooltipTrigger
                  as="span"
                  class="transform:translateY(0.125rem):active"
                >
                  <input
                    checked={props.value === option.value}
                    class={"hidden"}
                    name={props.key}
                    onChange={(e) => handleChange(e, option)}
                    type="radio"
                  />
                  <span
                    class={`${
                      props.value === option.value
                        ? "bb:1px|solid|primary fg:primary"
                        : ""
                    } flex align-items:center border:none cursor:pointer jc:center p:4px text:secondary transition:all|.15s|ease-in-out`}
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
                  </span>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent class="rounded-lg bg-corvu-100 px-3 py-2 font-medium corvu-open:animate-in corvu-open:fade-in-50 corvu-open:slide-in-from-bottom-1 corvu-closed:animate-out corvu-closed:fade-out-50 corvu-closed:slide-out-to-bottom-1">
                    <div
                      class={
                        "center bg:#333 color:white f:13 font-family:poppins font-weight:300 max-w:fit-content min-w:fit-content p:3|10 r:5 text:nowrap w:full z-index:1"
                      }
                    >
                      {option.tooltip ?? option.value}
                    </div>
                    <TooltipArrow class="" />
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </label>
          );
        }}
      </For>
    </div>
  );
};
