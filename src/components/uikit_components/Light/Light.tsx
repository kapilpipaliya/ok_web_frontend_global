import {BaseContainerProps} from "../globals";
import {setClassNames} from "../set-class-names";


export function Light(props: BaseContainerProps) {
  return (
    <div
      id={props.id}
      style={props.style}
      classList={{
        'uk-light': true,
        ...setClassNames(props),
      }}
    >
      {props.children}
    </div>
  );
}
