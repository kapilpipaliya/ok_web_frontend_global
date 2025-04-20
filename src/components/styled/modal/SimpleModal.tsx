import { createContext, type JSX, Show, useContext } from "solid-js";
import { As } from "~/components/As";

import { useZIndex } from "~/components/fields/ZIndex";
import { css } from "~/lib/styles";

interface SimpleWithDismissButtonProps {
  children?: JSX.Element;
  closeButtonText?: string;
  confirmButtonText?: string;
  description: string;
  isOpen?: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
}

const ModalContext = createContext<SimpleWithDismissButtonProps>();

export function SimpleWithDismissButton(
  props: Readonly<SimpleWithDismissButtonProps>,
) {
  const zIndex = useZIndex();
  return (
    <ModalContext.Provider value={props}>
      <As as="div"
        aria-labelledby="modal-title"
        aria-modal="true"
        css={css`
  position: relative;
  z-index: ${zIndex};
`}
        role="dialog"
      >
        <Backdrop />
        <ModalContent />
      </As>
    </ModalContext.Provider>
  );
}

function Backdrop() {
  return (
    <As as="div" css={css`
  background-color: rgb(107,114,128);
  inset: 0px;
  position: fixed;
`} />
  );
}

function DismissButton() {
  const props = useContext(ModalContext)!;
  return (
    <As as="div" css={css`
  display: none;
  position: absolute;
  padding-right: 1rem;
  padding-top: 1rem;
  right: 0px;
  top: 0px;
  @media (width >= 52.125rem) {
    display: block;
  }
`}>
      <As as="button" css={css`
  background-color: rgb(255,255,255);
  border-radius: 0.375rem;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.5);
  color: rgb(156,163,175);
  color: rgb(107,114,128);
  outline-offset: 2px;
  outline: 2px solid transparent;
  &:hover {
    color: rgb(107,114,128);
  }
`}
        onClick={props.onClose}
        type="button"
      >
        <span class="sr-only">Close</span>
        <As as="svg"
          aria-hidden="true"
          css={css`
  height: 1.5rem;
  width: 1.5rem;
`}
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          viewBox="0 0 24 24"
        >
          <path
            d="M6 18L18 6M6 6l12 12"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </As>
      </As>
    </As>
  );
}

function ModalBody() {
  const props = useContext(ModalContext)!;
  return <As as="div">{props.children}</As>;
}

function ModalContent() {
  const zIndex = useZIndex();
  return (
    <As as="div" css={css`
  inset: 0px;
  overflow-y: auto;
  position: fixed;
  width: 100vw;
  z-index: ${zIndex};
`}
    >
      <As as="div" css={css`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  min-height: 100%;
  padding: 1rem;
  text-align: center;
  @media (width >= 52.125rem) {
    align-items: center;
    padding: 0;
  }
`}>
        <ModalPanel />
      </As>
    </As>
  );
}

function ModalFooter() {
  const props = useContext(ModalContext)!;
  return (
    <As as="div" css={css`
  margin-top: 1.25rem;
  @media (width >= 52.125rem) {
    display: flex;
    flex-direction: row-reverse;
    margin-top: 1rem;
  }
`}>
      <Show when={props.confirmButtonText}>
        <As as="button" css={css`
  background-color: rgb(220,38,38);
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
  color: rgb(255,255,255);
  display: inline-flex;
  font-size: 0.875rem;
  font-weight: 600;
  justify-content: center;
  padding-left: 0.75rem; padding-right: 0.75rem;
  padding-top: 0.5rem; padding-bottom: 0.5rem;
  width: 100%;
  &:hover {
    background-color: rgb(209,33,33);
  }
  @media (width >= 52.125rem) {
    margin-left: 0.75rem;
    width: auto;
  }
`}
          onClick={props.onConfirm}
          type="button"
        >
          {props.confirmButtonText ?? "Confirm"}
        </As>
      </Show>
      <Show when={props.closeButtonText}>
        <As as="button" css={css`
  background-color: rgb(255,255,255);
  border-radius: 0.375rem;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.5);
  color: rgb(17,24,39);
  display: inline-flex;
  font-size: 0.875rem;
  font-weight: 600;
  justify-content: center;
  margin-top: 0.75rem;
  padding-left: 0.75rem; padding-right: 0.75rem;
  padding-top: 0.5rem; padding-bottom: 0.5rem;
  width: 100%;
  &:hover {
    background-color: rgb(249,250,251);
  }
  @media (width >= 52.125rem) {
    margin-top: 0;
    width: auto;
  }
`}
          onClick={props.onClose}
          type="button"
        >
          {props.closeButtonText ?? "Close"}
        </As>
      </Show>
    </As>
  );
}

function ModalHeader() {
  const props = useContext(ModalContext)!;
  return (
    <As as="div" css={css`
  @media (width >= 52.125rem) {
    display: flex;
    align-items: flex-start;
  }
`}>
      <As as="div" css={css`
  display: flex;
  align-items: center;
  background-color: rgb(254,226,226);
  border-radius: 9999px;
  height: 3rem;
  justify-content: center;
  width: 3rem;
  @media (width >= 52.125rem) {
    height: 2.5rem;
    margin-left: 0; margin-right: 0;
    width: 2.5rem;
  }
`}>
        <As as="svg"
          aria-hidden="true"
          css={css`
  color: rgb(220,38,38);
  height: 1.5rem;
  width: 1.5rem;
`}
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </As>
      </As>
      <As as="div" css={css`
  
  margin-top: 0.75rem;
  text-align: center;
  @media (width >= 52.125rem) {
    margin-left: 1rem;
    margin-top: 0;
    text-align: left;
  }
`}>
        <As as="h3" css={css`
  color: rgb(17,24,39);
  font-size: 1rem;
  font-weight: 600;
`}
          id="modal-title"
        >
          {props.title}
        </As>
        <As as="div" css={css`
  margin-top: 0.5rem;
`}>
          <As as="p" css={css`
  color: rgb(107,114,128);
  font-size: 0.875rem;
`}>
            {props.description}
          </As>
        </As>
      </As>
    </As>
  );
}

function ModalPanel() {
  return (
    <As as="div" css={css`
  background-color: rgb(255,255,255);
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04);
  overflow: hidden;
  padding-bottom: 1rem;
  position: relative;
  padding-top: 1.25rem;
  padding-left: 1rem; padding-right: 1rem;
  text-align: left;

  @media (width >= 52.125rem) {
    max-width: 32rem;
    padding: 1.5rem;
    margin-top: 2rem; margin-bottom: 2rem;
    width: 100%;
  }
`}>
      <DismissButton />
      <ModalHeader />
      <ModalBody />
      <ModalFooter />
    </As>
  );
}
