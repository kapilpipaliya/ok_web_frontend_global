import { Icon } from "@iconify-icon/solid";
import { splitProps } from "solid-js";

import type { GenericComponentProps } from "./type/FieldType";

interface IconFieldProps extends GenericComponentProps {
  class?: string;
  icon: string;
}

export const IconField = (props: IconFieldProps) => {
  const [local, others] = splitProps(props, ["class"]);

  return <Icon class={`${local.class || ""}`} noobserver {...others} />;
};
