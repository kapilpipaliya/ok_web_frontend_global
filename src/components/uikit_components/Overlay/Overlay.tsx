import { OverlayProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function Overlay(props: OverlayProps) {
  return (
    <div
      id={props.id}
      style={props.style}
      classList={{
        "uk-overlay": true,
        [`uk-position-${props.position}`]: !!props.position,
        [`uk-position-${props.type}`]: !!props.type,
        ...setClassNames(props),
      }}
    >
      {props.showIcon ? <span uk-overlay-icon /> : null}
    </div>
  );
}
