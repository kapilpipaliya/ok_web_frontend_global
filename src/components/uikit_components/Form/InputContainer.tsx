import {BaseContainerProps} from "../globals";
import {setClassNames} from "../set-class-names";


export function InputContainer   (props: BaseContainerProps) {
    return (
      <div
        id={props.id}
        style={props.style}
        classList={{
          'uk-form-controls': true,
          ...setClassNames(props)
        }}
      >
        {props.children}
      </div>
    );
}
