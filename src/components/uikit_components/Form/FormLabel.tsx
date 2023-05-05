import {JSX} from "solid-js";
import {setClassNames} from "../set-class-names";


export function FormLabel  (props: JSX.HTMLAttributes<HTMLLabelElement>) {

    return (
      <label
        id={props.id}
        style={props.style}
        classList={{
          [`uk-form-label`]: true,
          ...setClassNames(props)
        }}
        htmlFor={props.htmlFor}
      >
        {props.children}
      </label>
    );

}
