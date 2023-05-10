import { BaseContainerProps } from "../globals";
import { setClassNames } from "../set-class-names";

export function NavbarDropdown(props: BaseContainerProps) {
  return (
    <div
      id={props.id}
      style={props.style}
      classList={{
        "uk-navbar-dropdown": true,
        ...setClassNames(props),
      }}
    >
      <ul class="uk-nav uk-navbar-dropdown-nav">{props.children}</ul>
    </div>
  );
}
