import {BaseContainerProps} from "../globals";
import {setClassNames} from "../set-class-names";


export function Tab(props: BaseContainerProps) {
  return (
    <li
      id={props.id}
      style={props.style}
      classList={setClassNames(props)}
    >
      <a href="#">{props.children}</a>
    </li>
  );
}
