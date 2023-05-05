
import {setClassNames} from "../set-class-names";
import {CardProps} from "../globals";


export function Card(props: CardProps) {

  return (
    <div
      id={props.id}
      style={props.style}
      classList={{
        'uk-card': true,
        [`uk-card-default`]: !props.color,
        [`uk-card-${props.color}`]: !!props.color,
        [`uk-card-hover`]: props.hover,
        [`uk-card-${props.size}`]: !!props.size,
        ...setClassNames(props),
      }}
    >
      {props.children}
    </div>
  );
}