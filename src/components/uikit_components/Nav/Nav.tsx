import { setClassNames } from "../set-class-names";
import { NavProps } from "../globals";

export function Nav(props: NavProps) {
  return (
    <ul
      id={props.id}
      style={props.style}
      classList={{
        [`uk-nav`]: true,
        [`uk-nav-${props.preset}`]: !!props.preset,
        [`uk-nav-sub`]: props.child,
        [`uk-nav-parent-icon`]: props.accordion,
        ...setClassNames(props),
      }}
      data-uk-nav={props.options ? props.options : ""}
    >
      {props.children}
    </ul>
  );
}
