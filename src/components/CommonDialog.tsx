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
            class={`cursor:pointer bg:#dfe9f3d1:hover r:5|5|5|5 p:5|5|5|5 ${props.iconClass}`}
            ref={btnEl!}
          >
            {props.buttonLabel}
          </div>
        }
        when={props.openButton !== false}
      >
        <Icon
          aria-disabled={open()}
          class={`cursor:pointer bg:lightgrey:hover r:5|5|5|5 p:5|5|5|5 ${props.iconClass}`}
          color={"grey"}
          height={props.iconSize ?? 25}
          icon={props.buttonIcon ?? "material-symbols:error"}
          onClick={() => setOpen(true)}
          ref={btnEl!}
          width={props.iconSize ?? 25}
        />
      </Show>
      <Dismiss menuButton={btnEl!} modal open={open} setOpen={setOpen}>
        <div
          class="modal-container"
          onClick={onClickOverlay}
          role="presentation"
        >
          <div
            aria-modal="true"
            class={`modal r:10 ${props.dialogClass}`}
            role="dialog"
            tabindex="-1"
          >
            <div class={"mb:4 font-weight:bold"}>
              <Show fallback={props.customTitle} when={!props.customTitle}>
                {props.title}
              </Show>
              {props.closeButton !== false && (
                <button
                  class={"bg:lightgrey:hover r:5|5|5|5 p:0|5|0|5"}
                  onClick={onClickOverlay}
                  style={{float: "right"}}
                  title={"Close"}
                >
                  ✕
                </button>
              )}
            </div>
            <hr class={"fg:lightgrey"}/>
            <div class={"p:3 max-h:50vh overflow:auto"} style={props.bodyStyle}>
              {props.body}
            </div>
            <div class={"pt:5"}>{props.footer(setOpen)}</div>
          </div>
        </div>
      </Dismiss>
    </>
  );
}
