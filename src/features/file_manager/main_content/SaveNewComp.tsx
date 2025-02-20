import { createSignal, Show } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

import { PROPERTIES } from "~/components/styled/constants/constant";
import {
  dialogCancelButtonClass,
  DialogFooter,
  dialogOkButtonClass,
} from "~/components/styled/dialog/DialogFooter";
import { DialogHeader } from "~/components/styled/dialog/DialogHeader";
import { DialogSubTitle } from "~/components/styled/dialog/DialogSubTitle";
import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { useToast } from "~/components/styled/Toast";
import { checkUniqueConstrains } from "~/cypher/get/checkUniqueConstrains";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import { addNewVertex } from "~/lib/graph/mutate/vertex";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { parentCompAttribute, parentPermAttribute } from "~/lib/meta/base/Comp";
import { SchemaRenderer } from "~/pages/SchemaRenderer";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import { useFileManagerStore } from "../FileManagerContext";

export function SaveNewComp(
  props: Readonly<{
    onClose: () => void;
    onMouseLeave: () => void;
    parentRef: HTMLElement;
    saveAsLabel?: "Comp" | "Perm";
  }>,
) {
  const [graph, setGraph] = useGraph();
  const [fileManagerStore] = useFileManagerStore();
  const [error, setError] = createSignal("");
  const { showErrorToast, showSuccessToast } = useToast();

  const label = () =>
    props.saveAsLabel === "Perm" ? "Permission" : "Component";

  const formDataId = uuidv7();
  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: [props.saveAsLabel || "Comp"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );

  const saveComponent = async () => {
    const currentItem = fileManagerStore.selectedItem;

    const newFormTxnId = generateNewTxnId(graph, setGraph);

    const formVertex = graph.vertexes[formDataId];

    const createResult = createFormVertex(
      graph,
      setGraph,
      newFormTxnId,
      props.saveAsLabel || "Comp",
      {
        description: formVertex.P.description,
        key: formVertex.P.key,
      },
    );
    const dataVertex = createResult.vertex!;

    const parentFolderMetaVertex = {
      id: "",
      IN: {},
      L: [],
      OUT: {},
      P:
        props.saveAsLabel === "Perm"
          ? parentPermAttribute
          : parentCompAttribute,
    } as Vertex;

    setSelectionValue(
      newFormTxnId,
      dataVertex,
      graph,
      setGraph,
      parentFolderMetaVertex,
      currentItem!.id,
    );

    const commitData = commitTxn(newFormTxnId, graph);

    if (!commitData) {
      showErrorToast(`Failed to upload ${label()}`);
      return;
    }

    try {
      const result = await submitDataCall(
        { ...commitData },
        graph,
        setGraph,
        newFormTxnId,
      );
      if (!result.error) {
        fileManagerStore.gridStore?.[0].fetchTableData();
      }
    } catch (_err) {
      showErrorToast(`An error occurred while uploading the ${label()}`);
      return;
    }
    showSuccessToast(`${label()} uploaded successfully`);
  };

  const saveAsTemplate = async () => {
    const formVertex = graph.vertexes[formDataId];
    if (!formVertex.P.key) {
      setError("Please enter a name");
      return;
    }
    const res = await checkUniqueConstrains({
      L: [props.saveAsLabel || "Comp"],
      P: { key: formVertex.P.key },
    } as unknown as Vertex);
    if (res.error) {
      setError(res.error);
      return;
    }
    saveComponent();
  };

  const form = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Text",
            text: `${label()} Name`,
            validation: { required: true },
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextInput",
            key: "key",
            placeholder: `New ${label()} Name`,
            validation: { required: true },
          },
        ],
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS_NARROW,
        componentName: "Box",
      },
      {
        as: "div",
        attributes: [
          {
            class: SETTINGS_CONSTANTS.LABEL_CLASS,
            componentName: "Text",
            text: "Description",
          },
          {
            class: PROPERTIES.Css.TextField,
            componentName: "TextArea",
            key: "description",
            placeholder: "description",
          },
        ],
        class: SETTINGS_CONSTANTS.GRID_ITEM_CLASS_NARROW,
        componentName: "Box",
      },
    ],
    class: SETTINGS_CONSTANTS.FORM_CLASS,
    componentName: "Box",
  } as FieldAttribute;

  return (
    <DropdownMenu
      class="padding:0.50rem"
      onMouseLeave={props.onMouseLeave}
      parentRef={props.parentRef}
    >
      <DialogHeader title={`New ${label()}`} />
      <DialogSubTitle>
        {label()} key must be unique. If the key already exists, you will be
        prompted to change it.
      </DialogSubTitle>

      <SchemaRenderer
        form={{ attributes: [form], key: "Profile" }}
        formDataId={formDataId}
      />

      <Show when={error()}>
        <div class="fg:error">{error()}</div>
      </Show>

      <DialogFooter>
        <button
          class={dialogOkButtonClass}
          onClick={saveAsTemplate}
          type="button"
        >
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
