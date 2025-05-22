import { APP_NAME, APP_VERSION } from "~/pages/settings/constants";
import { css } from "~/lib/styles";
import { As } from "../As";

export function VersionDisplay() {
  return (
    <As
      as="div"
      css={[
        css`
  color: \${args.theme.var.color.primary};
  font-size: 12px;
  opacity: 0.8;
`,
      ]}
    >
      {APP_NAME} v{APP_VERSION}
    </As>
  );
}
