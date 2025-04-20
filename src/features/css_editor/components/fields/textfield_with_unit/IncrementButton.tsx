import { IconButton } from "~/components/styled/IconButton";
import { css } from "~/lib/styles";

export function IncrementButton(
  props: Readonly<{ downIncrement: (event: MouseEvent) => void }>,
) {
  return (
    <IconButton
      css={css`
        background: transparent;
        border: none;
        cursor: ns-resize;
      `}
      icon={"ph:arrows-vertical"}
      onMouseDown={props.downIncrement}
      size={16}
    />
  );
}
