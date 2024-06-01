import "~/css/modal.css";
import Dismiss from "solid-dismiss";
import { createSignal, type JSX, type Setter, Show } from "solid-js";
import { Icon } from "@iconify-icon/solid";

interface CustomModalProps {
  buttonLabel?: JSX.Element;
  buttonIcon?: string;
  title?: string | JSX.Element;
  customTitle?: JSX.Element;
  body: JSX.Element;
  footer: (setOpen: Setter<boolean>) => JSX.Element;
  dialogClass: string;
  bodyStyle?: JSX.CSSProperties;
  openButton?: boolean;
  closeButton?: boolean;
  iconSize?: number;
  iconClass?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const CustomModal = (props: CustomModalProps) => {
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
        when={props.openButton !== false}
        fallback={
          <div
            class={`cursor:pointer bg:#dfe9f3d1:hover r:5|5|5|5 p:5|5|5|5 ${props.iconClass}`}
            ref={btnEl!}
            aria-disabled={open()}
          >
            {props.buttonLabel}
          </div>
        }
      >
        <Icon
          ref={btnEl!}
          height={props.iconSize ?? 25}
          width={props.iconSize ?? 25}
          color={"grey"}
          aria-disabled={open()}
          class={`cursor:pointer bg:lightgrey:hover r:5|5|5|5 p:5|5|5|5 ${props.iconClass}`}
          onClick={() => setOpen(true)}
          icon={props.buttonIcon ?? "material-symbols:error"}
        ></Icon>
      </Show>
      <Dismiss menuButton={btnEl!} open={open} setOpen={setOpen} modal>
        <div
          class="modal-container"
          onClick={onClickOverlay}
          role="presentation"
        >
          <div
            class={`modal r:10 ${props.dialogClass}`}
            role="dialog"
            aria-modal="true"
            tabindex="-1"
          >
            <div class={"mb:4 font-weight:bold"}>
              <Show when={!props.customTitle} fallback={props.customTitle}>
                {props.title}
              </Show>
              {props.closeButton !== false && (
                <button
                  title={"Close"}
                  onClick={onClickOverlay}
                  class={"bg:lightgrey:hover r:5|5|5|5 p:0|5|0|5"}
                  style={{ float: "right" }}
                >
                  ✕
                </button>
              )}
            </div>
            <hr class={"fg:lightgrey"} />
            <div class={"p:3 max-h:50vh overflow:auto"} style={props.bodyStyle}>
              {props.body}
            </div>
            <div class={"pt:5"}>{props.footer(setOpen)}</div>
          </div>
        </div>
      </Dismiss>
    </>
  );
};

export default CustomModal;
