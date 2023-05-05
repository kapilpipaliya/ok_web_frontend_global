import {FormInputProps} from "../globals";
import {setClassNames} from "../set-class-names";


export function Range   (props: FormInputProps) {

    return (
      <input
        id={props.id}
        placeholder={props.placeholder}
        style={props.style}
        classList={{
          [`uk-range`]: true,
          [`uk-form-${props.color}`]: !!props.color,
          [`uk-form-${props.width}`]: !!props.width,
          [`uk-form-${props.layout}`]: !!props.layout,
          ...setClassNames(props)
        }}
        type="range"
        name={props.name}
        value={props.value}
        min={props.min}
        max={props.max}
        step={props.step}
        onChange={props.onChange}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
      />
    );

}
