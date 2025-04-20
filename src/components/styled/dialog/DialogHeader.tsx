import { As } from "~/components/As";
import { css } from "~/lib/styles";

export function DialogHeader(props: Readonly<{ title: string }>) {
  return (
    <As as="h3" css={css`
  color: #3b82f6;
  font-size: 1rem;
  font-weight: bold;
`}>
      {props.title}
    </As>
  );
}
