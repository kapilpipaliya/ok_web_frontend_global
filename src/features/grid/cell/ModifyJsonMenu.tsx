import { createWritableMemo } from "@solid-primitives/memo";
import { createSignal, onMount, Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { DialogFooter } from "~/components/styled/dialog/DialogFooter";
import { DialogHeader } from "~/components/styled/dialog/DialogHeader";
import { DialogSubTitle } from "~/components/styled/dialog/DialogSubTitle";
import { DropdownMenu } from "~/components/styled/modal/DropdownMenu";
import { useToast } from "~/components/styled/modal/Toast";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { useGraph } from "~/lib/graph/GraphContext";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

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
    } catch (error) {
      setError(error.message || "An unexpected error occurred");
    }
  };

  const modifyJson = async (data: string) => {
    try {
      const parsedData = JSON.parse(data);
      await updateVertexProperties(parsedData);
      props.onClose();
    } catch (error) {
      setError(error.message || "Invalid JSON format.");
    }
  };

  onMount(() => {
    jsonInputRef()?.focus();
  });

  return (
    <DropdownMenu
      css={css`
  padding: 0.50rem;
`}
      onMouseLeave={props.onMouseLeave}
      parentRef={props.parentRef}
    >
      <DialogHeader title="Modify JSON" />

      <DialogSubTitle>
        Please enter the JSON data you wish to modify.
      </DialogSubTitle>

      <div>
        <As
          as="label"
          css={css`
  color: #3b82f6;
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
`}
          for="jsonInput"
        >
          JSON Data
        </As>
        <As
          as="div"
          css={css`
  margin-top: 2px;
`}
        >
          <As
            as="textarea"
            css={css`
  border-radius: 0.375rem;
  border-width: 0;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.5);
  color: #3b82f6;
  display: block;
  font-size: 0.875rem;
  padding-left: 0.75rem; padding-right: 0.75rem;
  padding-top: 0.375rem; padding-bottom: 0.375rem;
  height: 800px;
  width: 800px;
`}
            id="jsonInput"
            onChange={(e) => setJsonData(e.target.value)}
            placeholder="Enter JSON data here"
            ref={setJsonInputRef}
            value={jsonData()}
          />
        </As>
      </div>
      <Show when={error()}>
        <As
          as="div"
          css={css`
  color: \${args.theme.var.color.error};
`}
        >
          {error()}
        </As>
      </Show>

      <DialogFooter
        buttonText="Save"
        css={SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CSS}
        disabled={!jsonData()}
        onClick={() => modifyJson(jsonData())}
      />
    </DropdownMenu>
  );
}
