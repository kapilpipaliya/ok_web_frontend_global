import {
  type Accessor,
  createSignal,
  type JSX,
  type Setter,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";

import { useGraph } from "~/lib/graph/graph";
import { useClickOutside } from "~/lib/hooks/useClickOutside";

import { useZIndex } from "./ZIndex";

interface CustomModalProps {
  bodyClass?: string;
  children: JSX.Element;
  closeButton?: boolean;
  customTitle?: JSX.Element;
  dialogClass?: string;
  footer?: (setOpen: Setter<boolean>) => JSX.Element;
  isCloseOnOutsideClick?: boolean;
  open?: Accessor<boolean>;
  setOpen?: (open: boolean) => void;
  title?: JSX.Element | string;
}

export function CustomModal(props: Readonly<CustomModalProps>) {
  const zIndex = useZIndex();
  const [open, setOpen] =
    props.open && props.setOpen
      ? ([props.open, props.setOpen] as [Accessor<boolean>, Setter<boolean>])
      : createSignal(false);

  const modalContainerClass = `position:fixed top:0 left:0 width:100% height:100% display:flex jc:center ai:center z-index:${zIndex} background-color:rgba(0,0,0,0.5)`;
  const modalClass = "position:relative background-color:white";

  const Content = () => {
    const [floating, setFloating] = createSignal<HTMLElement | undefined>();

    const [graph, setGraph] = useGraph();
    if (props.isCloseOnOutsideClick ?? true) {
      useClickOutside(graph, setGraph, (event) => {
        const path = event.composedPath();
        if (!path.includes(floating()!)) {
          setOpen(false);
        }
      });
    }

    const Header = () => {
      return (
        <div class="font-weight:bold mb:4">
          <Show fallback={props.customTitle} when={!props.customTitle}>
            {props.title}
          </Show>
          <Show when={props.closeButton !== false}>
            <button
              class="bg:lightgrey:hover float:right p:0|5|0|5 r:5|5|5|5"
              onClick={() => setOpen(false)}
              title="Close"
              type="button"
            >
              ✕
            </button>
          </Show>
        </div>
      );
    };
    return (
      <div
        aria-modal="true"
        class={`${modalClass} ${props.dialogClass ?? ""} r:10`}
        ref={setFloating}
        role="dialog"
      >
        <Header />
        <hr class="fg:lightgrey" />
        <div class={`${props.bodyClass ?? ""} overflow:auto p:3`}>
          {props.children}
        </div>
        {props.footer?.(setOpen)}
      </div>
    );
  };

  return (
    <Show when={open()}>
      <Portal>
        <div class={modalContainerClass} role="presentation">
          <Content />
        </div>
      </Portal>
    </Show>
  );
}
