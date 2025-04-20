import { As } from "~/components/As";
import { css } from "~/lib/styles";

export function ComponentName(props: { componentName: string }) {
  return (
    <As as="div"
      css={css`
  font-size: 0.875rem;
  margin-right: 4px;
`}
      title="Name"
    >
      {props.componentName}
    </As>
  );
}
