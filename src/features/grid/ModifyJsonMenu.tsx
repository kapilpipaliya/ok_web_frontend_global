import { createWritableMemo } from "@solid-primitives/memo";
import { createSignal, onMount, Show } from "solid-js";

import { DialogFooter } from "~/components/styled/dialog/DialogFooter";
import { DialogHeader } from "~/components/styled/dialog/DialogHeader";
import { DialogSubTitle } from "~/components/styled/dialog/DialogSubTitle";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { useToast } from "~/components/styled/Toast";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

export function ModifyJsonMenu(props: {
  item: Vertex;
  onClose: () => void;
  onMouseLeave: () => void;
  parentRef: HTMLElement;
}) {
  const [jsonData, setJsonData] = createWritableMemo(() =>
    JSON.stringify(props.item.P, null, 2),
  );
  const [error, setError] = createSignal("");
  const [graph, setGraph] = useGraph();
  const { showSuccessToast, showWarningToast } = useToast();

  const [jsonInputRef, setJsonInputRef] = createSignal<HTMLInputElement>();

  const updateVertexProperties = async (properties: { [key: string]: any }) => {
    const newFormTxnId = generateNewTxnId(graph, setGraph);
    replaceVertexProperties(
      newFormTxnId,
      props.item.id,
      graph,
      setGraph,
      properties,
    );

    const data = commitTxn(newFormTxnId, graph);

    if (!data) {
      showWarningToast("Internal Server Error");
      return;
    }

    try {
      await submitDataCall({ ...data }, graph, setGraph, newFormTxnId);
      showSuccessToast("Template Saved Successfully");
      props.onClose();
    } catch (_error) {
      setError("An unexpected error occurred");
    }
  };

  const modifyJson = async (data: string) => {
    try {
      const parsedData = JSON.parse(data);
      await updateVertexProperties(parsedData);
      props.onClose();
    } catch (_e) {
      setError("Invalid JSON format.");
    }
  };

  onMount(() => {
    jsonInputRef()?.focus();
  });

  return (
    <DropdownMenu
      class="padding:0.50rem"
      onMouseLeave={props.onMouseLeave}
      parentRef={props.parentRef}
    >
      <DialogHeader title="Modify JSON" />

      <DialogSubTitle>
        Please enter the JSON data you wish to modify.
      </DialogSubTitle>

      <div>
        <label
          class="lh:1.25rem color:gray-90 display:block f:0.875rem font-weight:500 leading:1.5rem"
          for="jsonInput"
        >
          JSON Data
        </label>
        <div class="mt:2">
          <textarea
            class="lh:1.25rem@sm border-radius:0.375rem border-width:0 box-shadow:0|0|0|1px|rgba(0,0,0,0.5) box-shadow:0|0|0|2px|rgba(0,0,0,0.5):focus color:gray-90 color:gray-40::placeholder display:block f:0.875rem leading:1.5rem@sm px:0.75rem py:0.375rem  h:800px w:800px"
            id="jsonInput"
            onChange={(e) => setJsonData(e.target.value)}
            placeholder="Enter JSON data here"
            ref={setJsonInputRef}
            value={jsonData()}
          />
        </div>
      </div>
      <Show when={error()}>
        <div class="fg:error">{error()}</div>
      </Show>

      <DialogFooter
        buttonText="Save"
        class={SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS}
        disabled={!jsonData()}
        onClick={() => modifyJson(jsonData())}
      />
    </DropdownMenu>
  );
}
