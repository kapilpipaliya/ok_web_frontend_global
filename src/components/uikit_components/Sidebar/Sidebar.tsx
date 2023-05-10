import { SidebarProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function Sidebar(props: SidebarProps) {
  return (
    <div
      id={props.id}
      style={props.style}
      classList={{
        [`uk-overflow-auto`]: true,
        [`uk-${props.visibility}`]: !!props.visibility,
        ...setClassNames(props),
      }}
    >
      {props.children}
    </div>
  );
}
