import { IconButton } from "~/components/styled/IconButton";
import { css } from "~/lib/styles";

interface PlusIconButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  size?: string;
}

export function PlusIconButton(props: PlusIconButtonProps) {
  return (
    <IconButton
      css={css`
        background-color: \${args.theme.var.color.primary_15};
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        &:hover {
          background-color: \${args.theme.var.color.primary_50};
        }
      `}
      icon="ph:plus"
      size={props.size || "18"}
      aria-label={props.ariaLabel || "Add new item"}
      onClick={props.onClick}
    />
  );
}
