import { Icon } from "@iconify-icon/solid";
import { JSX, splitProps } from "solid-js";

export const MenuIcon = (props: JSX.InputHTMLAttributes<HTMLSpanElement> & {icon: string}) => {
 const [selectedProps, customProps] = splitProps(props, ['icon']);

  return <Icon icon={selectedProps.icon} width={25} height={25} class="cursor:pointer" {...customProps}/>

};