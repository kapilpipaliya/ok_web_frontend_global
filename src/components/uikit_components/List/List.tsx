import { ListProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function List(props: ListProps) {
  return (
    <ul
      id={props.id}
      style={props.style}
      classList={{
        [`uk-link-${props.type}`]: !!props.type,
        ...setClassNames(props),
      }}
    >
      {props.children}
    </ul>
  );
}
