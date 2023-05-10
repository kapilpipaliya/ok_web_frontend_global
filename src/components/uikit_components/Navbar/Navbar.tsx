import { NavbarProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function Navbar(props: NavbarProps) {
  return (
    <div
      id={props.id}
      style={props.style}
      classList={{
        [`uk-navbar-left`]: props.left,
        [`uk-navbar-right`]: props.right,
        ...setClassNames(props),
      }}
    >
      <ul class="uk-navbar-nav">{props.children}</ul>
    </div>
  );
}
