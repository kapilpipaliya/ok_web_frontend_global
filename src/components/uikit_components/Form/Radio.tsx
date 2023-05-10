import { FormInputProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function Radio(props: FormInputProps) {
  return (
    <input
      id={props.id}
      placeholder={props.placeholder}
      style={props.style}
      classList={{
        [`uk-radio`]: true,
        [`uk-form-${props.color}`]: !!props.color,
        [`uk-form-${props.width}`]: !!props.width,
        [`uk-form-${props.layout}`]: !!props.layout,
        ...setClassNames(props),
      }}
      type="radio"
      name={props.name}
      checked={props.value}
      onChange={props.onChange}
      onBlur={props.onBlur}
      onFocus={props.onFocus}
    />
  );
}
