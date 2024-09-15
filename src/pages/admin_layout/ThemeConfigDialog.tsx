import { createSignal, Show } from "solid-js";

import {
  dialogCancelButtonClass,
  DialogFooter,
  dialogOkButtonClass,
} from "~/components/dialog/DialogFooter";
import { DialogHeader } from "~/components/dialog/DialogHeader";
import { DialogSubTitle } from "~/components/dialog/DialogSubTitle";
import { DropdownMenu } from "~/components/DropdownMenu";
import { useToast } from "~/components/Toast";
import { getErrorMessage } from "~/lib/api/getErrorMessage";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { createForm } from "~/lib/graph/mutate/form/createForm";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";

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
  const _saveNewTheme = async () => {
    const newFormTxnId = graph.newTxnId;
    const createResult = createForm(graph, setGraph, newFormTxnId, "Theme", {
      data: themeData(),
      key: "Default",
    });

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
    } catch (er) {
      setError(getErrorMessage(er));
      return null;
    }
  };

  const saveExistingTheme = async () => {
    const newFormTxnId = graph.newTxnId;
    const mergeResult = mergeVertexProperties(
      newFormTxnId,
      props.item.id,
      graph,
      setGraph,
      { data: themeData() },
    );
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
    <DropdownMenu class="padding:0.50rem" parentRef={props.parentRef}>
      <DialogHeader title="Configure Theme" />
      <DialogSubTitle>Customize your theme colors</DialogSubTitle>
      <div class="flex flex:col gap:0.50rem">
        <label>Theme Colors</label>
        <textarea
          class="h:400px w:400px"
          onInput={(e) => handleChange(e.target.value)}
          value={themeData()}
        />
      </div>
      <Show when={error()}>
        <div style={{ color: "red" }}>{error()}</div>
      </Show>
      <DialogFooter>
        <button class={dialogOkButtonClass} onClick={handleSave} type="button">
          Save
        </button>
        <button
          class={dialogCancelButtonClass}
          onClick={props.onClose}
          type="button"
        >
          Cancel
        </button>
      </DialogFooter>
    </DropdownMenu>
  );
}
