import {
  type Accessor,
  type JSX,
  Match,
  Switch,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  splitProps,
} from "solid-js";
import { Portal } from "solid-js/web";

import { type WrappedElement, getElements } from "../tools";
import "./modal.css";

export type WrappedModalContentProps = {
  open: Accessor<boolean>;
  /**
   * toggle
   *
   * if called with boolean argument, it will set the open state
   * according to the argument, otherwise toggle it
   */
  toggle: (open?: boolean | unknown) => void;
};

export type ModalProps = {
  children: JSX.Element | WrappedElement<WrappedModalContentProps>;
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  noPortal?: boolean;
  open?: boolean;
} & Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
>;

let modalCount = 0;

// Note: This class depends on class Name.
export function Modal(props: ModalProps): JSX.Element {
  const [local, containerProps] = splitProps(props, [
    "open",
    "noPortal",
    "children",
  ]);
  const [open, setOpen] = createSignal(local.open);
  const toggle = (open?: boolean) =>
    setOpen(typeof open === "boolean" ? open : (o) => !o);
  const modalContent = createMemo(
    () =>
      getElements(
        local.children,
        (node) => node.className.indexOf("sb-modal-content") !== -1,
        [{ open, toggle }],
      ) ?? [],
  );
  const otherChildren = createMemo(() =>
    getElements(
      local.children,
      (node) => node.className.indexOf("sb-modal-content") === -1,
      [{ open, toggle }],
    ),
  );

  let modalRef!: HTMLDivElement;
  createEffect(() => open() && (modalRef?.focus(), modalRef?.scrollIntoView()));

  modalCount++;

  createEffect(() => {
    if (!modalRef) {
      return;
    }
    const header = modalRef.querySelector(".sb-modal-header");
    if (header) {
      modalRef.setAttribute(
        "aria-labelledby",
        header.id || (() => (header.id = `sb-modal-header-${modalCount}`))(),
      );
    }
    const body = modalRef.querySelector(".sb-modal-body");
    if (body) {
      modalRef.setAttribute(
        "aria-describedby",
        body.id || (() => (body.id = `sb-modal-body-${modalCount}`))(),
      );
    }
  });

  const divProps = mergeProps(containerProps, {
    children: modalContent(),
    class: props.class ? `sb-modal ${props.class}` : "sb-modal",
    onClick: createMemo(() =>
      props.closeOnClickOutside
        ? (ev: MouseEvent) => {
            const target = ev.target as HTMLElement;
            if (!modalContent().some((content) => content?.contains(target))) {
              toggle(false);
            }
          }
        : undefined,
    )(),
    onkeyup: createMemo(() =>
      props.closeOnEsc !== false
        ? (ev: KeyboardEvent) => {
            if (ev.key === "Escape" && !ev.defaultPrevented) {
              setOpen(false);
            }
          }
        : undefined,
    )(),
    role: "dialog" as JSX.HTMLAttributes<HTMLDivElement>["role"],
    tabIndex: -1,
  });

  return (
    <Switch>
      <Match when={!open()}>{otherChildren()}</Match>
      <Match when={open() && local.noPortal}>
        <>
          {otherChildren()}
          <div ref={modalRef} {...divProps} />
        </>
      </Match>
      <Match when={open() && !local.noPortal}>
        <>
          {otherChildren()}
          <Portal mount={document.body}>
            <div ref={modalRef} {...divProps} />
          </Portal>
        </>
      </Match>
    </Switch>
  );
}

export type ModalContentProps = JSX.HTMLAttributes<HTMLDivElement>;

export function ModalContent(props: ModalContentProps) {
  return (
    <div
      {...props}
      class={
        props.class ? `sb-modal-content ${props.class}` : "sb-modal-content"
      }
    />
  );
}

export type ModalHeaderProps = JSX.HTMLAttributes<HTMLElement>;

export function ModalHeader(props: ModalHeaderProps) {
  return (
    <header
      {...props}
      class={props.class ? `sb-modal-header ${props.class}` : "sb-modal-header"}
    />
  );
}

export type ModalBodyProps = JSX.HTMLAttributes<HTMLElement>;

export function ModalBody(props: ModalBodyProps) {
  return (
    <main
      {...props}
      class={props.class ? `sb-modal-body ${props.class}` : "sb-modal-body"}
    />
  );
}

export type ModalFooterProps = JSX.HTMLAttributes<HTMLElement>;

export function ModalFooter(props: ModalFooterProps) {
  return (
    <footer
      {...props}
      class={props.class ? `sb-modal-footer ${props.class}` : "sb-modal-footer"}
    />
  );
}
