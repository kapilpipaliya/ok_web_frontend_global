import type * as Monaco from "monaco-editor";

import { clientOnly } from "@solidjs/start";
import { createSignal, Show } from "solid-js";

import { DialogFooter } from "~/components/styled/dialog/DialogFooter";
import { DialogHeader } from "~/components/styled/dialog/DialogHeader";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { useToast } from "~/components/styled/Toast";
import { getErrorMessage } from "~/lib/api/getErrorMessage";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { formatJavaScriptCode } from "~/lib/data_structure/string/formatUtils";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { PROPERTIES, SETTINGS_CONSTANTS } from "~/pages/settings/constants";

export function ThemeConfigDialog(
  props: Readonly<{
    item?: Vertex;
    onClose: () => void;
    onMouseLeave: () => void;
    parentRef: HTMLElement;
  }>,
) {
  const MonacoEditorWrapper = clientOnly(
    () => import("~/components/styled/MonacoEditorWrapper"),
  );
  const [graph, setGraph] = useGraph();
  const { showSuccessToast, showWarningToast } = useToast();
  const [error, setError] = createSignal("");
  const [themeData, setThemeData] = createSignal(
    props.item ? props.item.P.data : "",
  );
  const [themeName, setThemeName] = createSignal(
    props.item ? props.item.P.key : "New",
  );
  const [isSaving, setIsSaving] = createSignal(false);
  let editorRef: Monaco.editor.IStandaloneCodeEditor | undefined;

  const handleChange = (value: string) => {
    setThemeData(value);
  };

  const handleNameChange = (value: string) => {
    setThemeName(value);
  };

  const formatCode = async () => {
    if (editorRef) {
      try {
        const formatted = await formatJavaScriptCode(editorRef.getValue());
        editorRef.setValue(formatted);
      } catch (err) {
        console.error("Formatting failed:", err);
        showWarningToast("Failed to format code");
      }
    }
  };

  const saveNewTheme = async () => {
    const newFormTxnId = generateNewTxnId(graph, setGraph);
    const createResult = createFormVertex(
      graph,
      setGraph,
      newFormTxnId,
      "Theme",
      {
        data: themeData(),
        key: themeName(),
      },
    );

    if (createResult.error) {
      setError(createResult.error as string);
      return false;
    }

    const data = await handleCommitTxn(newFormTxnId);
    if (data) {
      props.onClose();
      return true;
    }
    return false;
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
    const newFormTxnId = generateNewTxnId(graph, setGraph);
    const mergeResult = mergeVertexProperties(
      newFormTxnId,
      props.item!.id,
      graph,
      setGraph,
      { data: themeData() },
    );
    if (mergeResult.error) {
      setError(mergeResult.error as string);
      return false;
    }

    const data = await handleCommitTxn(newFormTxnId);
    if (data) {
      props.onClose();
      return true;
    }
    return false;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (props.item) {
        await saveExistingTheme();
      } else {
        await saveNewTheme();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DropdownMenu class="padding:0.50rem" parentRef={props.parentRef}>
      <DialogHeader title={`Configure Theme [${themeName()}]`} />
      <div class="flex flex:col gap:0.50rem w:400px">
        <Show when={!props.item}>
          <label>Theme Name</label>
          <input
            class={PROPERTIES.Css.TextField}
            onInput={(e) => handleNameChange(e.target.value)}
            type="text"
            value={themeName()}
          />
        </Show>
        <label>Theme Configuration</label>
        <div class="flex flex:col gap:0.50rem">
          <MonacoEditorWrapper
            height="400px"
            language="javascript"
            onChange={handleChange}
            onMount={(editor) => (editorRef = editor)}
            value={themeData()}
          />
          <div class="flex ai:center gap:0.50rem">
            <button
              class="px:5 py:5 bg:gray-60 fg:base-5 r:5"
              onClick={formatCode}
              title="Format Code"
            >
              Format
            </button>
          </div>
        </div>
      </div>
      <Show when={error()}>
        <div class="bg:error p:0.5rem r:sm">{error()}</div>
      </Show>
      <DialogFooter>
        <button
          class={SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS}
          disabled={isSaving()}
          onClick={handleSave}
          type="button"
        >
          {isSaving() ? "Saving..." : "Save"}
        </button>
        <button
          class={SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CLASS}
          disabled={isSaving()}
          onClick={props.onClose}
          type="button"
        >
          Cancel
        </button>
      </DialogFooter>
    </DropdownMenu>
  );
}
