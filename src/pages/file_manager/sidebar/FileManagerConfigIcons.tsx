import { createSelector, createSignal, Show } from "solid-js";
import { createStore } from "solid-js/store";

import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { insertNewRow } from "~/components/fields/table_field/insertNewRow";
import { IconButton } from "~/components/styled/IconButton";
import { CommonAddComponent } from "~/components/page_designer/settings/rules/CommonAddComponent";
import { useToast } from "~/components/styled/Toast";
import { ZIndex } from "~/components/ZIndex";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";

import { useFileManagerStore } from "../FileManagerContext"; // Import QuickEditModal
import { QuickEditModal } from "~/components/grid/QuickEditModal";

export function FileManagerConfigIcons(
  props: Readonly<{ getChildrenItems?: () => void; metaVertex: Vertex }>,
) {
  const [graph, setGraph] = useGraph();
  const [fileManagerStore, _setFileManagerStore] = useFileManagerStore();
  const isSelectedItemId = createSelector(
    () => fileManagerStore.selectedItem?.id,
  );
  const isHoveredItemId = createSelector(
    () => fileManagerStore.treeItemHoverId,
  );
  const { showErrorToast, showSuccessToast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = createSignal(false);

  const [state, setState] = createStore({
    buttonRef: null as HTMLElement | null,
    dialogAction: (_name: string) => {},
    dialogLabel: "",
    dialogPlaceholder: "",
    dialogTitle: "",
    showDialog: false,
  });

  const handleCreateNewDirectory = async (key: string) => {
    try {
      const newFormTxnId = graph.newTxnId;
      const tableMetaVertex = {
        id: props.metaVertex.id,
        IN: {},
        L: [],
        OUT: {},
        P: {
          inward: true,
          label: "Folder",
          type: "ParentFolder",
        },
      } as Vertex;

      const _rowResult = insertNewRow(
        newFormTxnId,
        tableMetaVertex,
        props.metaVertex,
        false,
        graph,
        setGraph,
        { key },
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

  const handleCreateNewFile = (_name: string) => {
    // TODO: on new File add display full modal to insert file metaData or upload a file component
  };

  const handleRenameItem = (_name: string) => {};

  const openDialog = (
    title: string,
    label: string,
    placeholder: string,
    action: (key: string) => void,
    ref: HTMLElement,
  ) => {
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
      <Show
        when={
          state.showDialog ||
          isSelectedItemId(props.metaVertex.id) ||
          isHoveredItemId(props.metaVertex.id)
        }
      >
        <Show when={props.metaVertex.L[0] === "File"}>
          <IconButton
            class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
            icon="ic:round-download"
            iconClass="transition:0.5s|ease-in-out"
            onClick={() => {
              window.open(
                `/api/file/download?fileId=${props.metaVertex.id}`,
                "_blank",
              );
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
          onClick={(e) =>
            openDialog(
              "Add New Directory",
              "Enter Directory Name",
              "Enter directory key",
              handleCreateNewDirectory,
              e.currentTarget,
            )
          }
          size={18}
          title="Create New Directory"
        />
        <IconButton
          class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
          icon="mdi:file-plus"
          iconClass="transition:0.5s|ease-in-out"
          onClick={(e) =>
            openDialog(
              "Add New File",
              "Enter File Name",
              "Enter file key",
              handleCreateNewFile,
              e.currentTarget,
            )
          }
          size={18}
          title="Create New File"
        />
        <Show
          when={
            !fileManagerStore.root?.some(
              (root) => root.id === props.metaVertex.id,
            )
          }
        >
          <IconButton
            class="cursor:pointer mr:5px opacity:.5 opacity:1:hover"
            icon="mdi:rename-box"
            iconClass="transition:0.5s|ease-in-out"
            onClick={(e) =>
              openDialog(
                `Rename ${props.metaVertex.L[0]}`,
                `Enter ${props.metaVertex.L[0]} Name`,
                "Enter new key",
                handleRenameItem,
                e.currentTarget,
              )
            }
            size={18}
            title="Rename"
          />
          <IconButton
            class="color:red cursor:pointer mr:5px opacity:.5 opacity:1:hover"
            icon="mdi:delete"
            iconClass="transition:0.5s|ease-in-out"
            onClick={() => {}}
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
              addNewState={(key) => {
                state.dialogAction(key);
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
