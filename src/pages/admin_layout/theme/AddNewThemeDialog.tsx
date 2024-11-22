import { createSignal, Show } from "solid-js";

import { DialogFooter } from "~/components/styled/dialog/DialogFooter";

import { ThemeConfigDialog } from "./theme_config/ThemeConfigDialog";

export function AddNewThemeDialog() {
  const [showDialog, setShowDialog] = createSignal(false);
  const [buttonRef, setButtonRef] = createSignal<HTMLElement>();
  return (
    <>
      <DialogFooter
        buttonText="Add New Theme"
        onClick={() => setShowDialog(true)}
        ref={setButtonRef}
      />
      <Show when={showDialog()}>
        <ThemeConfigDialog
          onClose={() => setShowDialog(false)}
          onMouseLeave={() => setShowDialog(false)}
          parentRef={buttonRef()!}
        />
      </Show>
    </>
  );
}
