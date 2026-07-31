import { IconButton } from "~/components/styled/IconButton";

interface PlusIconButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  size?: string;
  ref?: (el: HTMLElement) => void;
}

export function PlusIconButton(props: PlusIconButtonProps) {
  return (
    <IconButton
      css={`return \`._id {
        background-color: \${t.var.color.primary_light_850};
        color: \${t.var.color.primary};
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        
        &:hover {
          background-color: \${t.var.color.primary_light_500};
          color: \${t.var.color.primary_light_500_text};
        }
      }\`;`}
      icon="ph:plus"
      ref={props.ref}
      size={props.size || "18"}
      aria-label={props.ariaLabel || "Add new item"}
      onClick={props.onClick}
    />
  );
}
