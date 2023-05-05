import {BaseContainerProps} from "../globals";
import {setClassNames} from "../set-class-names";

export function TableBody(props: BaseContainerProps) {
  return (
    <tbody
      id={props.id}
      style={props.style}
      classList={setClassNames(props)}
    >
      {props.children}
    </tbody>
  );
}
