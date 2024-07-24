
import { type Accessor, type JSX, type Setter, Show, createSignal } from "solid-js";
import { Portal } from "solid-js/web";

interface CustomModalProps {
  bodyClass?: JSX.CSSProperties;
  children: JSX.Element;
  closeButton?: boolean;
  customTitle?: JSX.Element;
  dialogClass: string;
  footer: (setOpen: Setter<boolean>) => JSX.Element;
  open?: Accessor<boolean>;
  setOpen?: (open: boolean) => void;
  title?: JSX.Element | string;
}

export function CustomModal(props: Readonly<CustomModalProps>) {
  const [open, setOpen] = (props.open && props.setOpen) ? [props.open, props.setOpen] as [Accessor<boolean>, Setter<boolean>] : createSignal(false);

  // remove the overlay click handler
  const onClickOverlay = (e: MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    setOpen(false);
  };
  const modalContainerClass = "position:fixed  top:0  left:0  width:100%  height:100%  display:flex  jc:center  ai:center  z-index:20  background-color:rgba(0,0,0,0.5)";
  const modalClass = "position:relative  width:80vw  max-width:800px  padding:15px  background-color:white";

  return (
      <Show when={open()}>
        <Portal>
          <div
            class={modalContainerClass}
            onClick={onClickOverlay}
            role="presentation"
          >
            <div
              aria-modal="true"
              class={`${modalClass} ${props.dialogClass} r:10`}
              role="dialog"
            >
              <div class={"font-weight:bold mb:4"}>
                <Show fallback={props.customTitle} when={!props.customTitle}>
                  {props.title}
                </Show>
                {props.closeButton !== false && (
                  <button
                    class={"bg:lightgrey:hover float:right p:0|5|0|5 r:5|5|5|5"}
                    onClick={onClickOverlay}
                    title={"Close"}
                  >
                    ✕
                  </button>
                )}
              </div>
              <hr class={"fg:lightgrey"} />
              <div class={`${props.bodyClass} overflow:auto p:3`}>
                {props.children}
              </div>
              <div class={"pt:5"}>{props.footer(setOpen)}</div>
            </div>
          </div>
        </Portal>
      </Show>
  );
}
