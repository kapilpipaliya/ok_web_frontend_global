import { OffcanvasProps } from "../globals";
import { createEffect } from "solid-js";
import { setClassNames } from "../set-class-names";

export function Offcanvas(props: OffcanvasProps) {
  createEffect(() => {
    if (props.onBeforeShow) {
      UIkit.util.on(props.id, "beforeshow", props.onBeforeShow);
    }

    if (props.onShow) {
      UIkit.util.on(props.id, "show", props.onShow);
    }

    if (props.onShown) {
      UIkit.util.on(props.id, "shown", props.onShown);
    }

    if (props.onBeforeHide) {
      UIkit.util.on(props.id, "beforehide", props.onBeforeHide);
    }

    if (props.onHide) {
      UIkit.util.on(props.id, "hide", props.onHide);
    }

    if (props.onHidden) {
      UIkit.util.on(props.id, "hidden", props.onHidden);
    }
  }, []);

  return (
    <div
      id={props.id}
      style={props.style}
      classList={setClassNames(props)}
      data-uk-offcanvas={props.options ? props.options : ""}
    >
      <div class="uk-offcanvas-bar">{props.children}</div>
    </div>
  );
}
