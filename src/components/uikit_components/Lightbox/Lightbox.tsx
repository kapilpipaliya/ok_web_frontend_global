import { LightboxProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function Lightbox(props: LightboxProps) {
  return (
    <div
      id={props.id}
      style={props.style}
      classList={setClassNames(props)}
      data-uk-lightbox={props.options ? props.options : ""}
    >
      {props.children}
    </div>
  );
}
