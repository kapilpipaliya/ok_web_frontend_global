import {createSignal} from "solid-js";
import {ProgressProps} from "../globals";
import {setClassNames} from "../set-class-names";

export function Progress(props: ProgressProps) {
  const [state, setState] = createSignal({ value: props.value });

  return (
    <progress
      id={props.id}
      style={props.style}
       classList={{
        'uk-progress': true,
         ...setClassNames(props)
      }}
      value={state().value}
      max={props.max}
    />
  );
}
