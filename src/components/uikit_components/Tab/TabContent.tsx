import { BaseContainerProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function TabContent(props: BaseContainerProps) {
  return (
    <li
      id={props.id}
      style={props.style}
      classList={{
        ...setClassNames(props),
      }}
    >
      {props.children}
    </li>
  );
}
