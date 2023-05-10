import { FormTextareaProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function Textarea(props: FormTextareaProps) {
  return (
    <textarea
      id={props.id}
      placeholder={props.placeholder}
      style={props.style}
      classList={{
        [`uk-textarea`]: true,
        [`uk-form-${props.color}`]: !!props.color,
        [`uk-form-${props.width}`]: !!props.width,
        [`uk-form-${props.layout}`]: !!props.layout,
        ...setClassNames(props),
      }}
      name={props.name}
      onChange={props.onChange}
      onBlur={props.onBlur}
      onFocus={props.onFocus}
    >
      {props.children}
    </textarea>
  );
}
