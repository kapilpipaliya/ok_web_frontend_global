import type { ParentProps } from "solid-js";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

export function DialogSubTitle(props: ParentProps) {
  return (
    <As as="div" css={css`
  color: #3b82f6;
  font-size: 0.875rem;
  max-width: 36rem;
  margin-top: 0.5rem;
`}>
      <As as="p">{props.children}</As>
    </As>
  );
}
