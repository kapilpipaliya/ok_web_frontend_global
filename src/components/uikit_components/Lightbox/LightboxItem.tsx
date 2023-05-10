import { LightboxItemProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function LightboxItem(props: LightboxItemProps) {
  return (
    <a
      id={props.id}
      style={props.style}
      classList={setClassNames(props)}
      href={props.href}
      data-caption={props.caption}
    >
      {props.children}
    </a>
  );
}
