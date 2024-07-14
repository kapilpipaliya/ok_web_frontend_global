import { Icon } from "@iconify-icon/solid";
import Dismiss from "solid-dismiss";
import { type JSX, type Setter, Show, createSignal } from "solid-js";

interface CustomModalProps {
  body: JSX.Element;
  bodyClass?: JSX.CSSProperties;
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
  const modalContainerClass = "position:fixed  top:0  left:0  width:100%  height:100%  display:flex  jc:center  ai:center  z-index:20  background-color:rgba(0,0,0,0.5)";
  const modalClass = "position:relative  width:80vw  max-width:800px  padding:15px  background-color:white";

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
      <Dismiss
        menuButton={btnEl!}
        modal
        open={open}
        overlay={false}
        setOpen={setOpen}
      >
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
              {props.body}
            </div>
            <div class={"pt:5"}>{props.footer(setOpen)}</div>
          </div>
        </div>
      </Dismiss>
    </>
  );
}
