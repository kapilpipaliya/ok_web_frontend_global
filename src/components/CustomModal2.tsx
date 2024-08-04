import { type JSX, type Setter, Show } from "solid-js";
import { Portal } from "solid-js/web";

import { useZIndex } from "./ZIndex";

interface ModalProps {
  children: JSX.Element;
  isOpen: boolean;
  onClose: Setter<boolean>;
  title: string;
}

export const CustomModal2 = (props: ModalProps) => {
  const zIndex = useZIndex();
  const modalContainerClass = `position:fixed  top:0  left:0  width:100%  height:100%  display:flex  jc:center  ai:center  z-index:${zIndex}  background-color:rgba(0,0,0,0.5)`;
  const modalClass = "position:relative  width:80vw  max-width:800px  padding:15px  background-color:white";

  return (
    <Show when={props.isOpen}>
      <Portal>
        <div class={modalContainerClass}>
          <div class={`${modalClass} min-w:30% p:0 r:10px`} role="dialog">
            <div class="display:flex font-weight:bold jc:space-between mb:4">
              <span>{props.title}</span>
              <button
                class="bg:lightgrey:hover float:right p:0|5|0|5 r:5px"
                onClick={() => props.onClose(false)}
                title="Close"
              >
                ✕
              </button>
            </div>
            <hr class="color:lightgrey" />
            <div class="max-h:50vh mt:10 overflow:auto p:3">
              {props.children}
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
};
