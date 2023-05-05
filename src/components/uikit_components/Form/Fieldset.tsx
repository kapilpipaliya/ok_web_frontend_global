import {BaseProps} from "../globals";
import {setClassNames} from "../set-class-names";


export function Fieldset  (props: BaseProps) {

    return (
      <fieldset
        id={props.id}
        style={props.style}
        classList={{
          [`uk-fieldset`]: true,
          ...setClassNames(props)
        }}
      >
        {props.children}
      </fieldset>
    );
  }

