import { Icon, type IconifyIconProps } from "@iconify-icon/solid";
import { splitProps } from "solid-js";


export const IconifyIcon = (props: IconifyIconProps) => {
  const [selected, restProps] = splitProps(props, ["icon", "height", "width"]);
  if (selected.icon === "allCustom") {
    return (
      <Icon
        height={selected.height ?? 23}
        icon={"radix-icons:box"}
        width={selected.width ?? 23}
        {...restProps} />
    );
  }
  if (selected.icon === "customIcon") {
    return (
      <Icon
        height={selected.height ?? 23}
        icon={"lucide:box-select"}
        width={selected.width ?? 23}
        {...restProps} />
    );
  }
  return (
    <Icon
      height={selected.height ?? 23}
      icon={selected.icon}
      width={selected.width ?? 23}
      {...restProps} />
  );
};
