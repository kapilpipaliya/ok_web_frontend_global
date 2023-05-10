import { FormSelectProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function Select(props: FormSelectProps) {
  return (
    <select
      id={props.id}
      placeholder={props.placeholder}
      style={props.style}
      classList={{
        [`uk-select`]: true,
        [`uk-form-${props.color}`]: !!props.color,
        [`uk-form-${props.width}`]: !!props.width,
        [`uk-form-${props.layout}`]: !!props.layout,
        ...setClassNames(props),
      }}
      value={props.value}
      onChange={props.onChange}
    >
      {props.children}
    </select>
  );
}
