import { NavItemProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function NavItem(props: NavItemProps) {
  return (
    <li
      id={props.id}
      style={props.style}
      classList={{
        [`uk-nav-${props.type}`]: !!props.type,
        [`uk-parent`]: props.parent,
        ...setClassNames(props),
      }}
    >
      {props.children}
    </li>
  );
}
