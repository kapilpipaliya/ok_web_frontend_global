import { createSignal, Show } from "solid-js";

import { AddNewButton } from "~/features/grid/AddNewButton";

import { SaveNewComp } from "./SaveNewComp";

export function AddNewCompButton() {
  const [showModal, setShowModal] = createSignal(false);
  let addNewButtonRef: HTMLElement;

  return (
    <div>
      <AddNewButton
        onClick={() => setShowModal(true)}
        ref={(el) => (addNewButtonRef = el)}
      />
      <Show when={showModal()}>
        <SaveNewComp
          onClose={() => setShowModal(false)}
          onMouseLeave={() => setShowModal(false)}
          parentRef={addNewButtonRef!}
        />
      </Show>
    </div>
  );
}
