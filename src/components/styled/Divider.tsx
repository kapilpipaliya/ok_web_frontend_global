import { As } from "~/components/As";
import { css } from "~/lib/styles";

export function Divider() {
  return (
    <As
      as="div"
      css={css`
      height: 1px;
      background-color: \${args.theme.var.color.base_20};
      margin: 8px 0;
    `}
    />
  );
}
