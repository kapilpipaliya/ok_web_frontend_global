import {NavbarContainerProps} from "../globals";
import {setClassNames} from "../set-class-names";


export function NavbarContainer(props: NavbarContainerProps) {

  return (
    <div>
      <nav
        id={props.id}
         classList={{
           'uk-navbar-container': true,
           [`uk-navbar-transparent`]: props.transparent,
           ...setClassNames(props)
      }}
        style={props.style}
        data-uk-navbar={props.options ? props.options : ''}
      >
        {props.children}
      </nav>
      {props.dropbar ? <div class="uk-navbar-dropbar" /> : null}
    </div>
  );
}
