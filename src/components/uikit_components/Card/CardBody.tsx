import { BaseContainerProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function CardBody(props: BaseContainerProps) {
  return (
    <div
      id={props.id}
      style={props.style}
      classList={{
        "uk-card-body": true,
        ...setClassNames(props),
      }}
    >
      {props.children}
    </div>
  );
}
