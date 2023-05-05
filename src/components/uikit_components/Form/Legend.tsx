import {BaseProps} from "../globals";
import {setClassNames} from "../set-class-names";

export function Legend  (props: BaseProps)  {
    return (
      <legend
        id={props.id}
        style={props.style}
        classList={{
          [`uk-legend`]: true,
          ...setClassNames(props)
        }}
      >
        {props.children}
      </legend>
    );
}
