import { splitProps } from "solid-js";

import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import {
  IconButton,
  type IconButtonProps,
} from "../../../components/styled/IconButton";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

export function AddNewButton(
  props: IconButtonProps & {
    buttonText?: string;
  },
) {
  const [local, rest] = splitProps(props, ["children", "buttonText"]);

  return (
    <IconButton
      css={[SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS]}
      icon="ph:plus"
      iconCss={css`margin-right: 5px;`}
      size={22}
      title="Add New"
      {...rest}
    >
      <As as="span">{local.buttonText || "Add New"}</As>
    </IconButton>
  );
}
