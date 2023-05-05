import {BaseContainerProps} from "../globals";
import {setClassNames} from "../set-class-names";


export function Dark(props: BaseContainerProps) {
  return (
    <div
      id={props.id}
      style={props.style}
      classList={{
        'uk-dark': true,
        ...setClassNames(props)
      }}
    >
      {props.children}
    </div>
  );
}
