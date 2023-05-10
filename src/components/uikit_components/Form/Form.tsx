import { FormProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function Form(props: FormProps) {
  return (
    <div
      id={props.id}
      style={props.style}
      classList={{
        [`uk-form-${props.layout}`]: !!props.layout,
        ...setClassNames(props),
      }}
      data-uk-form-custom={props.custom ? "" : null}
    >
      {props.children}
    </div>
  );
}
