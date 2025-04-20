import { autofocus } from "@solid-primitives/autofocus";
import { createSignal } from "solid-js";

import { CustomModal } from "~/components/styled/modal/CustomModal";

import { FormStatus } from "./FormStatus";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

// prevents from being tree-shaken by TS
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
autofocus;

/**
 * @deprecated This function is deprecated and will be deleted in future versions.
 */
export function FormStatusWrapper() {
  const [isOpen, setIsOpen] = createSignal(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)} type="button">
        Status
      </button>
      <CustomModal
        customTitle={<span>{"Status Confirmation"}</span>}
        dialogCss={css`min-width: 20%; border-radius: 10px; padding: 0;`}
        footer={(_toggle) => (
          <As as="div" css={css`
  align-items: center;
  display: flex;
  justify-content: end;
`}>
            <As as="button"
              autofocus
              css={css`
  margin-right: 7px;
`}
              onClick={() => {
                setIsOpen(false);
              }}
              use:autofocus
            >
              Cancel
            </As>
            <As as="button"
              css={css`
  margin-right: 10px;
`}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Confirm
            </As>
          </As>
        )}
        open={isOpen}
        setOpen={setIsOpen}
      >
        <FormStatus />
      </CustomModal>
    </>
  );
}
