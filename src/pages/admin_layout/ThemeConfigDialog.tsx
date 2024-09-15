import { createSignal, Show } from "solid-js";
import { useGraph, Vertex } from "~/lib/graph/graph";
import { DropdownMenu } from "~/components/DropdownMenu";
import { DialogHeader } from "~/components/dialog/DialogHeader";
import { DialogSubTitle } from "~/components/dialog/DialogSubTitle";
import { dialogCancelButtonClass, DialogFooter, dialogOkButtonClass } from "~/components/dialog/DialogFooter";
import { createForm } from "~/lib/graph/mutate/form/createForm";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { useToast } from "~/components/Toast";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

export function ThemeConfigDialog(
  props: Readonly<{
    item: Vertex;
    onClose: () => void;
    onMouseLeave: () => void;
    parentRef: HTMLElement;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const { showSuccessToast, showWarningToast } = useToast();
  const [error, setError] = createSignal("");
  const [themeData, setThemeData] = createSignal(props.item.P.data);

  const handleChange = (value: string) => {
    setThemeData(value);
  };
  const saveNewTheme = async () => {
    const newFormTxnId = graph.newTxnId;
    const createResult = createForm(
      graph,
      setGraph,
      newFormTxnId,
      "Theme",
      { key: "Default", data: themeData() },
    );

    if (createResult.error) {
      setError(createResult.error as string);
      return;
    }

    const data = await handleCommitTxn(newFormTxnId);
    if (data) {
      props.onClose();
    }
  };

  const handleCommitTxn = async (newFormTxnId: number) => {
    const data = commitTxn(newFormTxnId, graph);

    if (!data) {
      showWarningToast("Internal Server Error");
      return null;
    }

    try {
      await submitDataCall({ ...data }, graph, setGraph, newFormTxnId);
      showSuccessToast("Theme Saved Successfully");
      return data;
    } catch (_error) {
      setError("An unexpected error occurred");
      return null;
    }
  };

  const saveExistingTheme = async () => {
    const newFormTxnId = graph.newTxnId;
    const mergeResult = mergeVertexProperties(newFormTxnId, props.item.id,graph, setGraph, { data: themeData() });
    if (mergeResult.error) {
      setError(mergeResult.error as string);
      return;
    }

    const data = await handleCommitTxn(newFormTxnId);
    if (data) {
      props.onClose();
    }
  };

  const handleSave = async () => {
    // await saveNewTheme();
    await saveExistingTheme();
  };

  return (
    <DropdownMenu
      class="padding:0.50rem"
      parentRef={props.parentRef}
    >
      <DialogHeader title="Configure Theme" />
      <DialogSubTitle>Customize your theme colors</DialogSubTitle>
      <div class="flex flex:col gap:0.50rem">
        <label>Theme Colors</label>
        <textarea
          onInput={(e) => handleChange(e.target.value)}
          value={themeData()}
        class="h:400px w:400px"
        />
      </div>
      <Show when={error()}>
        <div style={{ color: "red" }}>{error()}</div>
      </Show>
      <DialogFooter>
        <button type="button" class={dialogOkButtonClass} onClick={handleSave}>Save</button>
        <button type="button" class={dialogCancelButtonClass} onClick={props.onClose}>Cancel</button>
      </DialogFooter>
    </DropdownMenu>
  );
}
