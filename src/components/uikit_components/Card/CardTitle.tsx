import {BaseContainerProps} from "../globals";
import {setClassNames} from "../set-class-names";


export function CardTitle(props: BaseContainerProps) {
  return (
    <h3
      id={props.id}
      style={props.style}
      classList={{
        'uk-card-title': true,
        ...setClassNames(props),
      }}
    >
      {props.children}
    </h3>
  );
}
