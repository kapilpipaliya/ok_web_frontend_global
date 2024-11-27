import { createMemo, createSignal, type JSX } from "solid-js";

import type { FileManagerObject } from "~/pages/file_manager/FileManagerContext";

import { useFormContext } from "~/components/form/FormContext";
import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/Toast";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";

import { FilePickerModal } from "./FilePickerModal";

interface FilePickerButtonProps
  extends JSX.InputHTMLAttributes<HTMLInputElement> {
  handleChange: (value: string) => void;
  meta: Vertex;
  value: string;
}

export function FilePickerButton(props: Readonly<FilePickerButtonProps>) {
  const [openDialog, setOpenDialog] = createSignal(false);
  const [graph, setGraph] = useGraph();
  let fileManagerStore: FileManagerObject;
  const [formStore] = useFormContext();
  const { showErrorToast } = useToast();

  const selectedFileVertex = createMemo((): Vertex[] => {
    if (!props.meta) {
      return [];
    }
    return (
      evalExpression(
        `->$0Src`,
        { graph, setGraph, vertexes: [props.meta] },
      ) || []
    );
  });

  const onFileSelected = () => {
    const selectedFile = fileManagerStore.gridStore?.[0].selectedRows[0];
    if (!selectedFile) {
      showErrorToast("Please select a file");
      return;
    }
    const txnId = formStore?.txnId;
    if (!txnId) {
      showErrorToast("unable to select file");
      return;
    }

    const selectedFileMetaVertex = {
      id: "",
      IN: {},
      L: [],
      OUT: {},
      P: {
        key: "src",
      },
    } as Vertex;

    setSelectionValue(
      txnId,
      props.meta,
      graph,
      setGraph,
      selectedFileMetaVertex,
      selectedFile.id,
    );

    if (!(props.value ?? "").includes("$1")) {
      const newValue = `$1${props.value ?? ""}`;
      props.handleChange(newValue);
    }

    setOpenDialog(false);
  };

  const setFileManagerStore = (fileManagerStore_: FileManagerObject) => {
    fileManagerStore = fileManagerStore_;
  };

  return (
    <>
      <IconButton
        class={selectedFileVertex().length > 0 ? "color:green" : ""}
        icon={"solar:gallery-linear"}
        onClick={() => setOpenDialog(true)}
        size={16}
      />
      <FilePickerModal
        onFileSelected={onFileSelected}
        open={openDialog}
        selectedFileVertex={selectedFileVertex()}
        setFileManagerStore={setFileManagerStore}
        setOpen={setOpenDialog}
      />
    </>
  );
}
