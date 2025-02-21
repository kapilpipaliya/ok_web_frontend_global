import { splitProps } from "solid-js";

import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import {
  IconButton,
  type IconButtonProps,
} from "../../components/styled/IconButton";

export function AddNewButton(props: IconButtonProps) {
  const [_local, rest] = splitProps(props, ["children"]);

  return (
    <IconButton
      class={SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS}
      icon="ph:plus"
      iconClass="mr:5"
      size={22}
      title="Add New"
      {...rest}
    >
      <span>Add New</span>
    </IconButton>
  );
}
