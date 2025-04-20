import { css } from "~/lib/styles";
import { As } from "../As";

export function LoaderNew(
  props: Readonly<{ class?: string; loaderHeight?: string }>,
) {
  return (
    <As
      as="div"
      css={css`
  display: grid;
  height: ${props.loaderHeight ?? "100vh"};
  place-content: center;
`}
    >
      <As
        as="div"
        css={css`
  ${props.class ?? ""}
`}
      >
        Loading
      </As>
    </As>
  );
}
