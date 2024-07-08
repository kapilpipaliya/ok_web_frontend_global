import { Icon } from "@iconify-icon/solid";
import Dismiss from "solid-dismiss";
import { type JSX, type Setter, Show, createSignal } from "solid-js";

import "~/css/modal.css";

interface CustomModalProps {
  body: JSX.Element;
  bodyStyle?: JSX.CSSProperties;
  buttonIcon?: string;
  buttonLabel?: JSX.Element;
  closeButton?: boolean;
  customTitle?: JSX.Element;
  dialogClass: string;
  footer: (setOpen: Setter<boolean>) => JSX.Element;
  iconClass?: string;
  iconSize?: number;
  open?: boolean;
  openButton?: boolean;
  setOpen?: (open: boolean) => void;
  title?: JSX.Element | string;
}

export function CustomModal(props: CustomModalProps) {
  const [open, setOpen] = createSignal(props.open ?? false);
  let btnEl: any;

  const onClickClose = () => {
    setOpen(false);
  };

  const onClickOverlay = (e: MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    setOpen(false);
  };

  return (
    <>
      <Show
        fallback={
          <div
            aria-disabled={open()}
            class={`${props.iconClass} bg:#dfe9f3d1:hover cursor:pointer p:5|5|5|5 r:5|5|5|5`}
            ref={btnEl!}
          >
            {props.buttonLabel}
          </div>
        }
        when={props.openButton !== false}
      >
        <Icon
          aria-disabled={open()}
          class={`${props.iconClass} bg:lightgrey:hover cursor:pointer p:5|5|5|5 r:5|5|5|5`}
          color={"grey"}
          height={props.iconSize ?? 25}
          icon={props.buttonIcon ?? "material-symbols:error"}
          onClick={() => setOpen(true)}
          ref={btnEl!}
          width={props.iconSize ?? 25}
        />
      </Show>
      <Dismiss menuButton={btnEl!} modal open={open} overlay={false} setOpen={setOpen}>
        <div
          class="modal-container"
          onClick={onClickOverlay}
          role="presentation"
        >
          <div
            aria-modal="true"
            class={`modal ${props.dialogClass} r:10`}
            role="dialog"
          >
            <div class={"font-weight:bold mb:4"}>
              <Show fallback={props.customTitle} when={!props.customTitle}>
                {props.title}
              </Show>
              {props.closeButton !== false && (
                <button
                  class={"bg:lightgrey:hover p:0|5|0|5 r:5|5|5|5"}
                  onClick={onClickOverlay}
                  style={{float: "right"}}
                  title={"Close"}
                >
                  ✕
                </button>
              )}
            </div>
            <hr class={"fg:lightgrey"}/>
            <div class={"max-h:50vh overflow:auto p:3"} style={props.bodyStyle}>
              {props.body}
            </div>
            <div class={"pt:5"}>{props.footer(setOpen)}</div>
          </div>
        </div>
      </Dismiss>
    </>
  );
}
