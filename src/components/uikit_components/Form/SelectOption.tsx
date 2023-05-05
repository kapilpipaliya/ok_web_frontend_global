import {JSX} from "solid-js";
import {setClassNames} from "../set-class-names";


export function SelectOption  (props: JSX.HTMLAttributes<HTMLOptionElement>)  {
    return (
      <option
        id={props.id}
        style={props.style}
        classList={setClassNames(props)}
        value={props.value}
      >
        {props.children}
      </option>
    );
}
