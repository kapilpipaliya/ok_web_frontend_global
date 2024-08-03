import { Show, createSelector, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import { DropdownMenu } from "~/components/DropdownMenu";
import { IconButton } from "~/components/IconButton";
import { useToast } from "~/components/Toast";
import { ZIndex } from "~/components/ZIndex";
import { insertNewRow } from "~/components/fields/table_field/insertNewRow";
import { CommonAddComponent } from "~/components/page_designer/settings/rules/CommonAddComponent";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { type Vertex, useGraph } from "~/lib/graph/graph";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";

import { useFileManagerStore } from "../FileManagerContext";  // Import QuickEditModal
import { QuickEditModal } from "~/components/grid/QuickEditModal";


export function FileManagerConfigIcons(props: Readonly<{ getChildrenItems?: () => void, metaVertex: Vertex }>) {
  const [graph, setGraph] = useGraph();
  const [fileManagerStore, setFileManagerStore] = useFileManagerStore();
  const isSelectedItemId = createSelector(() => fileManagerStore.selectedItem?.id);
  const isHoveredItemId = createSelector(() => fileManagerStore.treeItemHoverId);
  const { showErrorToast, showSuccessToast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = createSignal(false);

  const [state, setState] = createStore({
    buttonRef: null as HTMLElement | null,
    dialogAction: (name: string) => { },
    dialogLabel: "",
    dialogPlaceholder: "",
    dialogTitle: "",
    showDialog: false,
  });

  const handleCreateNewDirectory = async (name: string) => {
    try {
      const newFormTxnId = graph.newTxnId;
      const tableMetaVertex = {
        IN: {},
        L: [],
        OUT: {},
        P: {
          inward: true,
          label: "Folder",
          type: "ParentFolder",
        },
        id: props.metaVertex.id,
      } as Vertex;

      const rowResult = insertNewRow(
        newFormTxnId,
        tableMetaVertex,
        props.metaVertex,
        false,
        graph,
        setGraph,
        { name },
      );
      const data = commitTxn(newFormTxnId, graph);

      if (!data) {
        showErrorToast("Failed to create directory");
        return;
      }

      await submitDataCall({ ...data }, graph, setGraph, newFormTxnId);
      showSuccessToast("Directory created successfully");
      props.getChildrenItems?.();
    } catch (error) {
      console.error(error);
      showErrorToast("Failed to create directory");
    }
  };

  const handleCreateNewFile = (name: string) => {
    // Implement create new file functionality
    console.log(`Create new file: ${name}`);
    // TODO: on new File add display full modal to insert file metaData or upload a file component
  };

  const handleRenameItem = (name: string) => {
    // Implement rename functionality
    console.log(`Rename item to: ${name}`);
  };

  const openDialog = (title: string, label: string, placeholder: string, action: (name: string) => void, ref: HTMLElement) => {
    setState({
      buttonRef: ref,
      dialogAction: action,
      dialogLabel: label,
      dialogPlaceholder: placeholder,
      dialogTitle: title,
      showDialog: true,
    });
  };

  return (
    <div class="flex ai:center">
      <Show when={state.showDialog || isSelectedItemId(props.metaVertex.id) || isHoveredItemId(props.metaVertex.id)}>
        <Show when={props.metaVertex.L[0] === "File"}>
          <IconButton
            class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
            icon="ic:round-download"
            iconClass="transition:0.5s|ease-in-out"
            onClick={() => {
              window.open(`/api/file/download?fileId=${props.metaVertex.id}`, '_blank');
            }}
            size={18}
            title="Download"
          />
        </Show>
        <IconButton
          class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
          icon="mdi:settings"
          iconClass="transition:0.5s|ease-in-out"
          onClick={() => setIsEditModalOpen(true)}
          size={18}
          title="Settings"
        />
        <IconButton
          class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
          icon="mdi:folder-plus"
          iconClass="transition:0.5s|ease-in-out"
          onClick={(e) => openDialog("Add New Directory", "Enter Directory Name", "Enter directory name", handleCreateNewDirectory, e.currentTarget)}
          size={18}
          title="Create New Directory"
        />
        <IconButton
          class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
          icon="mdi:file-plus"
          iconClass="transition:0.5s|ease-in-out"
          onClick={(e) => openDialog("Add New File", "Enter File Name", "Enter file name", handleCreateNewFile, e.currentTarget)}
          size={18}
          title="Create New File"
        />
        <Show when={fileManagerStore.root?.id !== props.metaVertex.id}>
          <IconButton
            class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
            icon="mdi:rename-box"
            iconClass="transition:0.5s|ease-in-out"
            onClick={(e) => openDialog(`Rename ${props.metaVertex.L[0]}`, `Enter ${props.metaVertex.L[0]} Name`, "Enter new name", handleRenameItem, e.currentTarget)}
            size={18}
            title="Rename"
          />
          <IconButton
            class="color:red cursor:pointer mr:5px opacity:.5 opacity:1:hover"
            icon="mdi:delete"
            iconClass="transition:0.5s|ease-in-out"
            onClick={() => {
              // Implement delete functionality
              console.log("Delete item");
            }}
            size={18}
            title="Delete"
          />
        </Show>
      </Show>
      <Show when={state.showDialog}>
        <ZIndex>
          <DropdownMenu
            class="r:5"
            onClickOutside={() => setState("showDialog", false)}
            parentRef={state.buttonRef!}
          >
            <CommonAddComponent
              addNewState={(name) => {
                state.dialogAction(name);
                setState("showDialog", false);
              }}
              label={state.dialogLabel}
              onClose={() => setState("showDialog", false)}
              placeholder={state.dialogPlaceholder}
              title={state.dialogTitle}
            />
          </DropdownMenu>
        </ZIndex>
      </Show>
      <Show when={isEditModalOpen()}>
        <QuickEditModal
          disabled={false}
          info={{ row: { original: props.metaVertex } }}
          onClose={() => setIsEditModalOpen(false)}
          tableId={props.metaVertex.L[0]}
        />
      </Show>
    </div>
  );
}
