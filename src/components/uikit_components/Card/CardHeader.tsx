import { BaseContainerProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function CardHeader(props: BaseContainerProps) {
  return (
    <div
      id={props.id}
      style={props.style}
      classList={{
        "uk-card-header": true,
        ...setClassNames(props),
      }}
    >
      {props.children}
    </div>
  );
}
