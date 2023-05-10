import { BaseContainerProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function CardFooter(props: BaseContainerProps) {
  return (
    <div
      id={props.id}
      style={props.style}
      classList={{
        "uk-card-footer": true,
        ...setClassNames(props),
      }}
    >
      {props.children}
    </div>
  );
}
