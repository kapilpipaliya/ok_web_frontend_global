import { Icon, type IconifyIconProps } from "@iconify-icon/solid";
import { type JSXElement, Show, splitProps } from "solid-js";

import { CustomTooltip } from "~/components/Tooltip";
import "~/css/componentUtilCSS.css";

export const IconifyIcon = (props: IconifyIconProps) => {
  const [selected, restProps] = splitProps(props, ["icon", "height", "width"]);
  if (selected.icon === "allCustom") {
    return (
      <Icon
        height={selected.height ?? 23}
        icon={"radix-icons:box"}
        width={selected.width ?? 23}
        {...restProps}
      />
    );
  }
  if (selected.icon === "customIcon") {
    return (
      <Icon
        height={selected.height ?? 23}
        icon={"lucide:box-select"}
        width={selected.width ?? 23}
        {...restProps}
      />
    );
  }
  return (
    <Icon
      height={selected.height ?? 23}
      icon={selected.icon}
      width={selected.width ?? 23}
      {...restProps}
    />
  );
};

export const ContainerLabel = (props: {
  class?: any;
  info?: any;
  onIconClick?: any;
  showIcon?: boolean;
  title: JSXElement;
}) => (
  <span
    class={`${props.class} flex ai:center font-weight:400 font:14 m:0 pt:5`}
  >
    {props.title}
    <Show when={props.showIcon ?? false}>
      &nbsp;
      <Icon
        class={"cursor:pointer"}
        icon={"mdi:close"}
        onClick={props.onIconClick}
        style={{ 'color': 'purple' }}
      />
    </Show>
    <Show when={props.info}>
      <CustomTooltip message={'Click for more Info'} title={props.title} >
        <div class={"flex cursor:pointer"} onClick={() => {
          window.open(`https://developer.mozilla.org/en-US/docs/Web/CSS/${props.info}`, '_blank');
        }}><Icon height={21} icon={"mdi:information-outline"} style={{ 'color': 'lightgray', 'margin-left': '2px' }} width={21} /></div>
      </CustomTooltip>
    </Show>
  </span>
);

export const Container = (props: { children: JSXElement; class?: string }) => (
  <span
    class={`${props.class} flex ai:center flex-shrink:0 jc:space-between min-h:45px w:full`}
  >
    {props.children}
  </span>
);

export const CenterDiv = (props: { children: JSXElement }) => (
  <div class={"flex ai:center jc:space-between w:full"}>{props.children}</div>
);
