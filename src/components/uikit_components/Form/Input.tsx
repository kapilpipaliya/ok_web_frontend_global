import {FormInputProps} from "../globals";
import {setClassNames} from "../set-class-names";


export function Input  (props: FormInputProps) {

    return (
      <input
        id={props.id}
        placeholder={props.placeholder}
        style={props.style}
        classList={{
          [`uk-input`]: true,
          [`uk-form-${props.color}`]: !!props.color,
          [`uk-form-${props.width}`]: !!props.width,
          [`uk-form-${props.layout}`]: !!props.layout,
          ...setClassNames(props)
        }}
        type="text"
        name={props.name}
        checked={props.value}
        onChange={props.onChange}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
      />
    );
  }

}
