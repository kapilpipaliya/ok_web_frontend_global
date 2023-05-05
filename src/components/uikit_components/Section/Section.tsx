import {SectionProps} from "../globals";
import {setClassNames} from "../set-class-names";

export function Section(props: SectionProps) {

  return (
    <div
      id={props.id}
      style={props.style}
       classList={{
         [`uk-section`]: props.padding,
         [`uk-section-${props.color}`]: !!props.color,
         [`uk-section-${props.size}`]: !!props.size,
         [`uk-preserve-color`]: props.preserveColor,
         ...setClassNames(props),
           [`uk-position-${props.position}`]: !!props.position,
      }}
    >
      {props.children}
    </div>
  );
}
