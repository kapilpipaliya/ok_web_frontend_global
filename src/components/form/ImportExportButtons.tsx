import { Icon } from "@iconify-icon/solid";

import { IconButton } from "~/components/styled/IconButton";
import { css } from "~/lib/styles";
import { As } from "../As";

// deprecated, not used function
export function ImportExportButtons(
  props: Readonly<{ setPopup: (value: boolean) => void }>,
) {
  return (
    <As as="div" css={css`
  display: flex;
  justify-content: end;
  margin-bottom: 10px;
`}>
      <As as="button" css={css`
  display: flex;
`} onClick={() => props.setPopup(true)} type="button">
        <Icon height={22} icon={"ph:arrow-square-in"} noobserver width={22} />
        Import
      </As>
      <IconButton
        css={css`
  display: flex;
  border: 1px solid \${args.theme.var.color.primary};
  background-color: transparent;
  border: none;
`}
        icon="ph:arrow-square-out"
        onClick={() => props.setPopup(true)}
        size={22}
        type="button"
      >
        Export
      </IconButton>
    </As>
  );
}
