import { As } from "~/components/As";
import { css } from "~/lib/styles";

export function Overlay() {
  return (
    <As as="div" css={css`
  background-color: rgb(107,114,128);
  inset: 0px;
  position: fixed;
`} />
  );
}
