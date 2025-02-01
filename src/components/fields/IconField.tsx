import { Icon } from "@iconify-icon/solid";
import { splitProps } from "solid-js";

import type { GenericComponentProps } from "./FieldType";

interface IconFieldProps extends GenericComponentProps {
  class?: string;
  icon: string;
  isViewMode?: boolean;
  viewModeClass?: string;
}

export const IconField = (props: IconFieldProps) => {
  const [local, others] = splitProps(props, [
    "componentName",
    "onChange",
    "value",
    "class",
    "isViewMode",
    "viewModeClass",
  ]);

  return (
    <Icon
      class={`${local.isViewMode ? local.viewModeClass : local.class || ""}`}
      noobserver
      {...others}
    />
  );
};
