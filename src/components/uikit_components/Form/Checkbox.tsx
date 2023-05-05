import {FormInputProps} from "../globals";
import {setClassNames} from "../set-class-names";


export function Checkbox   (props: FormInputProps) {

    return (
      <input
        id={props.id}
        placeholder={props.placeholder}
        style={props.style}
    classList={{
      [`uk-checkbox`]: true,
      [`uk-form-${props.color}`]: !!props.color,
      [`uk-form-${props.width}`]: !!props.width,
      [`uk-form-${props.layout}`]: !!props.layout,
      ...setClassNames(props)
    }}
        type="checkbox"
        name={props.name}
        value={props.value}
        onChange={props.onChange}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
      />
    );


}
