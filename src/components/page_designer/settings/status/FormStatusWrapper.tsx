import { autofocus } from "@solid-primitives/autofocus";
import { createSignal } from "solid-js";
// prevents from being tree-shaken by TS
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
autofocus

import { CustomModal } from "~/components/CustomModal";

import { FormStatus } from "./FormStatus";

export function FormStatusWrapper() {
  const [isOpen, setIsOpen] = createSignal(false);
  return <>
    <button onClick={() => setIsOpen(true)} type="button">Status</button>
    <CustomModal
      customTitle={<span>{"Status Confirmation"}</span>}
      dialogClass="min-w:20% r:10px p:0"
      footer={(toggle) => (
        <div class={"flex ai:center jc:end"}>
          <button
            autofocus
            class="danger mr:7px"
            onClick={() => {
              setIsOpen(false)
            }}
            use:autofocus
          >
            Cancel
          </button>
          <button
            class="mr:10px"
            onClick={() => {
              setIsOpen(false)
            }}
          >
            Confirm
          </button>
        </div>
      )}
      open={isOpen}
      setOpen={setIsOpen}
    >
      <FormStatus />
    </CustomModal>
  </>;
}