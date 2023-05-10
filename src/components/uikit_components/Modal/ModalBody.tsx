import { setClassNames } from "../set-class-names";
import { ModalBodyProps } from "../globals";

export function ModalBody(props: ModalBodyProps) {
  return (
    <div
      classList={{
        "uk-modal-body": true,
        ...setClassNames(props),
      }}
      id={props.id}
      style={props.style}
    >
      {props.children}
    </div>
  );
}
