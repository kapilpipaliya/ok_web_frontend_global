import { setClassNames } from "../set-class-names";
import { createEffect, createSignal, splitProps } from "solid-js";
import { AlertProps } from "../globals";

export function Alert(props: AlertProps) {
  const [selectedProps, customProps] = splitProps(props, ["color", "duration", "isClosable", "onBeforeHide", "onHide"]);

  let durationTimeout: any = null,
    leaveTimeout: any = null;

  const [state, setState] = createSignal({
    isOpen: true,
    isClosed: false,
    component: null,
  });

  const handleClose = () => {
    setState({ ...state(), isOpen: false });
    if (selectedProps.onBeforeHide) {
      selectedProps.onBeforeHide();
    }
    leaveTimeout = setTimeout(() => {
      setState({ ...state(), isClosed: true });
      if (selectedProps.onHide) {
        selectedProps.onHide();
      }
    }, 505);
  };

  createEffect(() => {
    if (selectedProps.duration) {
      durationTimeout = setTimeout(() => {
        handleClose();
      }, selectedProps.duration);
    }

    return () => {
      if (leaveTimeout) clearTimeout(leaveTimeout);
      if (durationTimeout) clearTimeout(durationTimeout);
    };
  });

  if (state().isClosed) return null;

  // @ts-ignore
  return (
    // <div class="uk-alert-primary" uk-alert>
    //   <a class="uk-alert-close" uk-close></a>
    //   <p>{props.data.properties[props.meta.properties[IdAttr]]}</p>
    // </div>
    <div
      classList={{
        "uk-alert": true,
        [`uk-alert-${selectedProps.color}`]: !!selectedProps.color,
        ...setClassNames(props),
      }}
      style={{
        overflow: "hidden",
        transition: "transform 0.5s ease-out, opacity 0.3s ease-out",
        transform: !state().isOpen ? "scaleY(0)" : "scaleY(100px)",
        opacity: !state().isOpen ? "0" : "1",
        // @ts-ignore
        ...props.style,
      }}
    >
      {selectedProps.isClosable && <a class="uk-alert-close" uk-close onclick={handleClose}></a>}
      <span>{props.content}</span>
    </div>
  );
}
