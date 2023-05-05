import {ContainerProps} from "../globals";
import {setClassNames} from "../set-class-names";


export function Container(props: ContainerProps) {
  return (
    <div
      id={props.id}
      style={props.style}
      classList={{
        [`uk-container`]: true,
        [`uk-container-${props.size}`]: !!props.size,
        ...setClassNames(props),
      }}
    >
      {props.children}
    </div>
  );
}
