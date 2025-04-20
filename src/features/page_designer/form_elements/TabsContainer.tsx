import type { ParentProps } from "solid-js";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

export function TabsContainer(props: ParentProps) {
  return (
    <As as="div" css={[css`
  lh: 1rem;
  border-bottom-width: 1px;
  border-color: rgb(229,231,235);
  color: rgb(107,114,128);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 10px;
  text-align: center;
`]}>
      {props.children}
    </As>
  );
}
