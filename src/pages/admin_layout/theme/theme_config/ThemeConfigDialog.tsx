import { createSignal, Show } from "solid-js";

import { PROPERTIES } from "~/components/styled/constants/constant";
import {
  dialogCancelButtonClass,
  DialogFooter,
  dialogOkButtonClass,
} from "~/components/styled/dialog/DialogFooter";
import { DialogHeader } from "~/components/styled/dialog/DialogHeader";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { useToast } from "~/components/styled/Toast";
import { getErrorMessage } from "~/lib/api/getErrorMessage";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";

export function ThemeConfigDialog(
  props: Readonly<{
    item?: Vertex; // Make item optional
    onClose: () => void;
    onMouseLeave: () => void;
    parentRef: HTMLElement;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const { showSuccessToast, showWarningToast } = useToast();
  const [error, setError] = createSignal("");
  const [themeData, setThemeData] = createSignal(
    props.item ? props.item.P.data : "",
  );
  const [themeName, setThemeName] = createSignal(
    props.item ? props.item.P.key : "New",
  );

  const handleChange = (value: string) => {
    setThemeData(value);
  };

  const handleNameChange = (value: string) => {
    setThemeName(value);
  };

  const saveNewTheme = async () => {
    const newFormTxnId = generateNewTxnId(graph, setGraph);
    const createResult = createFormVertex(graph, setGraph, newFormTxnId, "Theme", {
      data: themeData(),
      key: themeName(),
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
      return;
    }

    const data = await handleCommitTxn(newFormTxnId);
    if (data) {
      props.onClose();
    }
  };

  const handleSave = async () => {
    if (props.item) {
      await saveExistingTheme();
    } else {
      await saveNewTheme();
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
        <textarea
          class={`${PROPERTIES.Css.TextField} h:400px`}
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
