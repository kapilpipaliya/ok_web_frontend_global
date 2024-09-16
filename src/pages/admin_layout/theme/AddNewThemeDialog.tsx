import { createSignal, Show } from "solid-js";
import { DialogFooter } from "~/components/dialog/DialogFooter";
import { ThemeConfigDialog } from "./theme_config/ThemeConfigDialog";


export function AddNewThemeDialog() {
  const [showDialog, setShowDialog] = createSignal(false);
  const [buttonRef, setButtonRef] = createSignal<HTMLElement>();
  return (
    <>
      <DialogFooter onClick={() => setShowDialog(true)} buttonText="Add New Theme" ref={setButtonRef} />
      <Show when={showDialog()}>
        <ThemeConfigDialog
          onClose={() => setShowDialog(false)}
          onMouseLeave={() => setShowDialog(false)}
          parentRef={buttonRef()!} />
      </Show>
    </>
  );
}
