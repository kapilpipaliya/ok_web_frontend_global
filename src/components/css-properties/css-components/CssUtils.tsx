import { type IconifyIconProps, Icon } from "@iconify-icon/solid";
import { splitProps, Show, type JSXElement } from "solid-js";
import "~/css/componentUtilCSS.css";

export const IconifyIcon = (props: IconifyIconProps) => {
    const [selected, restProps] = splitProps(props, [
        "icon",
        "height",
        "width",
    ]);
    if (selected.icon === "allCustom") {
        return (
            <Icon
                icon={"radix-icons:box"}
                height={selected.height ?? 23}
                width={selected.width ?? 23}
                {...restProps}
            />
        );
    } else if (selected.icon === "customIcon") {
        return (
            <Icon
                icon={"lucide:box-select"}
                height={selected.height ?? 23}
                width={selected.width ?? 23}
                {...restProps}
            />
        );
    } else {
        return (
            <Icon
                icon={selected.icon}
                height={selected.height ?? 23}
                width={selected.width ?? 23}
                {...restProps}
            />
        );
    }
};

export const ContainerLabel = (props: {
    title: JSXElement;
    showIcon?: boolean;
    onIconClick?: any;
    class?: any;
}) => (
    <span
        class={`flex ai:center m:0 pt:5 font:14 font-weight:400 ${props.class}`}
    >
        {props.title}
        <Show when={props.showIcon ?? false}>
            &nbsp;
            <Icon
                onClick={props.onIconClick}
                icon={"mdi:close"}
                class={"cursor:pointer"}
            />
        </Show>
    </span>
);

export const Container = (props: { class?: string; children: JSXElement }) => (
    <span
        class={`w:full min-h:45px flex ai:center jc:space-between flex-shrink:0 ${props.class}`}
    >
        {props.children}
    </span>
);

export const CenterDiv = (props: { children: JSXElement }) => (
    <div class={"w:full flex ai:center jc:space-between"}>{props.children}</div>
);