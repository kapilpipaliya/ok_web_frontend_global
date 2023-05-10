import { NavbarStickyProps } from "../globals";
import { createEffect } from "solid-js";
import { setClassNames } from "../set-class-names";

export function NavbarSticky(props: NavbarStickyProps) {
  const validateIdProp = () => {
    if (!props.id) {
      console.error("ID property is required to register to Navbar Sticky events");
    }
  };

  createEffect(() => {
    if (props.onActive) {
      validateIdProp();
      // @ts-ignore
      UIkit.util.on(props.id, "active", props.onActive);
    }
    if (props.onInactive) {
      validateIdProp();
      // @ts-ignore
      UIkit.util.on(props.id, "active", props.onInactive);
    }
  }, []);

  return (
    <div
      id={props.id}
      style={props.style}
      classList={setClassNames(props)}
      data-uk-sticky={`
                sel-target: .uk-navbar-container;
                cls-active: uk-navbar-sticky;
                ${props.options ? props.options : ""}
            `}
    >
      {props.children}
    </div>
  );
}
