import { Icon } from "@iconify-icon/solid";
import { JSX, splitProps } from "solid-js";

export const MenuIcon = (props: JSX.InputHTMLAttributes<HTMLDivElement> & {icon: string}) => {
 const [selectedProps, customProps] = splitProps(props, ['icon']);
 return <div class="cursor:pointer" {...customProps}>
  <Icon icon={selectedProps.icon} width={25} height={25} />
 </div>;
};