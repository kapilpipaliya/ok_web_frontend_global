import { setClassNames } from "../set-class-names";
import { ScrollspyProps } from "../globals";

export function Scrollspy(props: ScrollspyProps) {
  return (
    <div
      id={props.id}
      style={props.style}
      classList={setClassNames(props)}
      data-uk-scrollspy={props.options ? props.options : ""}
    >
      {props.children}
    </div>
  );
}
