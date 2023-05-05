import {setClassNames} from "../set-class-names";
import {BadgeProps} from "../globals";


export function Badge(props: BadgeProps) {
  return (
    <span
      id={props.id}
      style={props.style}
      classList={{
        'uk-badge': true,
        ...setClassNames(props),
      }}
    >
      {props.count}
    </span>
  );
}
