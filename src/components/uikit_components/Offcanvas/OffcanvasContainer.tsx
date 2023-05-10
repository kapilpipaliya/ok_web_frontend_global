import { BaseContainerProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function OffcanvasContainer(props: BaseContainerProps) {
  return (
    <div
      id={props.id}
      style={props.style}
      classList={{
        "uk-offcanvas-content": true,
        ...setClassNames(props),
      }}
    >
      {props.children}
    </div>
  );
}
