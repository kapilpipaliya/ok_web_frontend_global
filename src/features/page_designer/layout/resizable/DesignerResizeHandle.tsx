import { type Component } from "solid-js";

import { As } from "~/components/As";

import { DESIGNER_RESIZE_VISIBLE_SIZE, type ResizeAxis } from "./useDesignerResizeTrackSize";

export type { ResizeAxis } from "./useDesignerResizeTrackSize";

interface DesignerResizeHandleProps {
  active: boolean;
  ariaLabel?: string;
  axis: ResizeAxis;
  onPointerDown: (e: PointerEvent) => void;
}

export const DesignerResizeHandle: Component<DesignerResizeHandleProps> = (
  props,
) => {
  const isXAxis = () => props.axis === "x";

  const handlePointerDown = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    props.onPointerDown(e);
  };

  return (
    <As
      aria-label={props.ariaLabel ?? "Resize panels"}
      aria-orientation={isXAxis() ? "vertical" : "horizontal"}
      as="button"
      css={`return \`._id {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 0;
        border: 0;
        background: transparent;
        cursor: ${isXAxis() ? "col-resize" : "row-resize"};
        touch-action: none;
        -webkit-touch-callout: none;
        user-select: none;
        flex-shrink: 0;

        &::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          ${
            isXAxis()
              ? `width: ${DESIGNER_RESIZE_VISIBLE_SIZE}px; height: 100%;`
              : `height: ${DESIGNER_RESIZE_VISIBLE_SIZE}px; width: 100%;`
          }
          background-color: \${args.theme.var.color.border};
          transition: background-color 0.2s;
        }

        &[data-active]::before {
          background-color: \${args.theme.var.color.text_light_300};
        }

        @media (hover: hover) {
          &:hover::before {
            background-color: \${args.theme.var.color.text_light_300};
          }
        }
      }\`;`}
      data-active={props.active ? "" : undefined}
      onPointerDown={handlePointerDown}
      role="separator"
      type="button"
    />
  );
};
