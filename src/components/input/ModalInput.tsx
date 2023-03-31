import { createSignal, JSXElement, Show } from "solid-js";
import usePopper from "solid-popper";

export const ModalInput = (props: {
  btnContent: JSXElement;
  children: JSXElement;
}) => {
  const [isVisible, setIsVisible] = createSignal(false);
  const [target, setTarget] = createSignal<HTMLDivElement>();
  const [popper, setPopper] = createSignal<HTMLDivElement>();
  usePopper(target, popper, {
    placement: "bottom",
  });
  return (
    <>
      <button type="button" ref={setTarget} onClick={() => setIsVisible(true)}>
        {props.btnContent}
      </button>
      <Show when={isVisible()}>
        <div ref={setPopper}>
          {props.children}
          <button type="button" onClick={() => setIsVisible(false)}>
            Close
          </button>
        </div>
      </Show>
    </>
  );
};
