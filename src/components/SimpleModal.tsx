import { createContext, type JSX, Show, useContext } from "solid-js";

import { useZIndex } from "~/components/ZIndex";


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
export function SimpleWithDismissButton(props: Readonly<SimpleWithDismissButtonProps>) {
  const zIndex = useZIndex();
  return (
    <ModalContext.Provider value={props}>
      <div
        aria-labelledby="modal-title"
        aria-modal="true"
        class={`position:relative z:${zIndex}`}
        role="dialog"
      >
        <Backdrop />
        <ModalContent />
      </div>
    </ModalContext.Provider>
  );
}

function Backdrop() {
  return (
    <div class="--bg-opacity:0.75 ~duration:150ms ~easing:cubic-bezier(0.4,0,0.2,1) ~property:opacity bg:rgb(107,114,128) inset:0px position:fixed" />
  );
}

function ModalContent() {
  const zIndex = useZIndex();
  return (
    <div class={`inset:0px overflow-y:auto position:fixed width:100vw z:${zIndex}`}>
      <div class="flex align-items:flex-end align-items:center@sm justify-content:center min-height:100% p:1rem padding:0@sm text-align:center">
        <ModalPanel />
      </div>
    </div>
  );
}

function ModalPanel() {
  return (
    <div class="~duration:150ms ~easing:cubic-bezier(0.4,0,0.2,1) ~property:all bg:rgb(255,255,255) border-radius:0.5rem box-shadow:0|20px|25px|-5px|rgba(0,0,0,0.1),0|10px|10px|-5px|rgba(0,0,0,0.04) max-width:32rem@sm my:2rem@sm overflow:hidden p:1.5rem@sm pb:1rem position:relative pt:1.25rem px:1rem text-align:left translate(0,0) width:100%@sm">
      <DismissButton />
      <ModalHeader />
      <ModalBody />
      <ModalFooter />
    </div>
  );
}

function DismissButton() {
  const props = useContext(ModalContext)!;
  return (
    <div class="display:none display:block@sm position:absolute pr:1rem pt:1rem right:0 top:0">
      <button
        class="--ring-color:rgb(99,102,241):focus bg:rgb(255,255,255) border-radius:0.375rem box-shadow:0|0|0|2px|rgba(0,0,0,0.5):focus color:rgb(156,163,175) color:rgb(107,114,128):hover outline-offset:2px:focus outline:2px|solid|transparent"
        onClick={props.onClose}
        type="button"
      >
        <span class="sr-only">Close</span>
        <svg aria-hidden="true" class="h:1.5rem w:1.5rem" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function ModalHeader() {
  const props = useContext(ModalContext)!;
  return (
    <div class="flex@sm align-items:flex-start@sm">
      <div class="flex align-items:center bg:rgb(254,226,226) border-radius:9999px flex-shrink:0 h:3rem h:2.5rem@sm justify-content:center mx:auto mx:0@sm w:3rem w:2.5rem@sm">
        <svg aria-hidden="true" class="color:rgb(220,38,38) h:1.5rem w:1.5rem" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="ml:1rem@sm mt:0.75rem margin-top:0@sm text-align:center text-align:left@sm">
        <h3 class="lh:1.5rem color:rgb(17,24,39) f:1rem font-weight:600 leading:1.5rem" id="modal-title">{props.title}</h3>
        <div class="mt:0.5rem">
          <p class="lh:1.25rem color:rgb(107,114,128) f:0.875rem">{props.description}</p>
        </div>
      </div>
    </div>
  );
}


function ModalBody() {
  const props = useContext(ModalContext)!;
  return <div>{props.children}</div>;
}

function ModalFooter() {
  const props = useContext(ModalContext)!;
  return (
    <div class="flex@sm flex-direction:row-reverse@sm mt:1.25rem mt:1rem@sm">
      <Show when={props.confirmButtonText}>
        <button
          class="lh:1.25rem bg:rgb(220,38,38) bg:rgb(239,68,68):hover border-radius:0.375rem box-shadow:0|1px|2px|0|rgba(0,0,0,0.05) color:rgb(255,255,255) display:inline-flex f:0.875rem font-weight:600 justify-content:center ml:0.75rem@sm px:0.75rem py:0.5rem width:100% width:auto@sm"
          onClick={props.onConfirm}
          type="button"
        >
          {props.confirmButtonText ?? "Confirm"}
        </button>
      </Show>
      <Show when={props.closeButtonText}>
        <button
          class="lh:1.25rem ring-inset --ring-color:rgb(209,213,219) bg:rgb(255,255,255) bg:rgb(249,250,251):hover border-radius:0.375rem box-shadow:0|0|0|1px|rgba(0,0,0,0.5) color:rgb(17,24,39) display:inline-flex f:0.875rem font-weight:600 justify-content:center mt:0.75rem margin-top:0@sm px:0.75rem py:0.5rem width:100% width:auto@sm"
          onClick={props.onClose}
          type="button"
        >
          {props.closeButtonText ?? "Close"}
        </button>
      </Show>
    </div>
  );
}
