import { splitProps } from "solid-js";

import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import {
  IconButton,
  type IconButtonProps,
} from "../../components/styled/IconButton";

export function AddNewButton(
  props: IconButtonProps & {
    buttonText?: string;
  },
) {
  const [local, rest] = splitProps(props, ["children", "buttonText"]);

  return (
    <IconButton
      class={SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS}
      icon="ph:plus"
      iconClass="mr:5"
      size={22}
      title="Add New"
      {...rest}
    >
      <span>{local.buttonText || "Add New"}</span>
    </IconButton>
  );
}
