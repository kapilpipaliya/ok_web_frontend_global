import {Icon} from "@iconify-icon/solid";

export const ComponentUtils = () =>{
    const IconifyIcon = (props: any) => {
        const { icon, height = 23, width, ...restProps } = props;
        return <Icon icon={icon} height={height ?? 23} width={width ?? 23} {...restProps} />;
    };

    const ContainerLabel =
        (props: { title: any,class?:any }) => <span class={`flex ai:center m:0 font:15px font-weight:500 ${props.class}`}>{props.title}</span>

    const Container =
        (props:any) => <span class={`w:full p:0|20px|0|16px min-h:50px flex ai:center jc:space-between flex-shrink:0 ${props.class}`}>{props.children}</span>

    return {
        IconifyIcon, Container, ContainerLabel
    }
}

