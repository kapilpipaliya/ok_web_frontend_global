import {
  type Accessor,
  createSignal,
  type JSX,
  type Setter,
  Show,
} from "solid-js";
import { Portal } from "solid-js/web";

import { useGraph } from "~/lib/graph/graph";
import { createClickOutside } from "~/lib/hooks/createClickOutside";
import { SETTINGS_CONSTANTS, STYLES } from "~/pages/settings/constants";

import { useZIndex } from "../fields/ZIndex";

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
  const _zIndex = useZIndex();
  const [open, setOpen] =
    props.open && props.setOpen
      ? ([props.open, props.setOpen] as [Accessor<boolean>, Setter<boolean>])
      : createSignal(false);

  const Content = () => {
    const [floating, setFloating] = createSignal<HTMLElement | undefined>();

    const [graph, setGraph] = useGraph();
    if (props.isCloseOnOutsideClick ?? true) {
      createClickOutside(graph, setGraph, (event) => {
        const path = event.composedPath();
        if (!path.includes(floating()!)) {
          setOpen(false);
        }
      });
    }

    const Header = () => {
      return (
        <div class={SETTINGS_CONSTANTS.MODAL.HEADER.CLASS}>
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
        class={`${SETTINGS_CONSTANTS.MODAL.BODY.CLASS} ${props.dialogClass ?? ""} r:10`}
        ref={setFloating}
        role="dialog"
      >
        <Header />
        <hr class="fg:lightgrey" />
        <div class={`${props.bodyClass ?? ""} ${STYLES.overflow} p:3`}>
          {props.children}
        </div>
        {props.footer?.(setOpen)}
      </div>
    );
  };

  return (
    <Show when={open()}>
      <div class={SETTINGS_CONSTANTS.MODAL.OVERLAY_CLASS} />
      <Portal>
        <div class={`${SETTINGS_CONSTANTS.MODAL.CONTAINER_CLASS}`}>
          <Content />
        </div>
      </Portal>
    </Show>
  );
}
