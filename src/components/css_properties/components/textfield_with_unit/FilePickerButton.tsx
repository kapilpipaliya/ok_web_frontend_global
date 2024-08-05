import jsep from "jsep";
import { type JSX, createMemo, createSignal } from "solid-js";

import type { FileManagerObject } from "~/pages/file_manager/FileManagerContext";

import { CustomModal } from "~/components/CustomModal";
import { IconButton } from "~/components/IconButton";
import { useToast } from "~/components/Toast";
import { useFormContext } from "~/components/form/FormContext";
import { evaluate } from "~/lib/expression_eval";
import { type Vertex, useGraph } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import FileManager from "~/pages/file_manager/FileManager";

import type { TextFieldOptionsField } from "../../constants/FieldType";

import { useCssEditorProps } from "../../CSSEditorPropsContext";
import { useComponentMeta, useCssState } from "../../CssEditorContext";
import { getCssSelectedFileEdgeName } from "../../utils/getCssSelectedFileEdgeName";

interface FilePickerButtonProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  handleChange: (event: Event) => void;
  selectedValue: () => string;
} 
export function FilePickerButton(props: Readonly<FilePickerButtonProps>) {
  const [openDialog, setOpenDialog] = createSignal(false);
  const [graph, setGraph] = useGraph();
  let fileManagerStore: FileManagerObject;
  const meta = useComponentMeta() as TextFieldOptionsField;
  const cssEditorProps = useCssEditorProps();
  const [formStore] = useFormContext();
  const { showErrorToast } = useToast();
  const [state] = useCssState();

  const selectedFileVertex = createMemo((): Vertex[] => {
    if (!cssEditorProps?.meta || !cssEditorProps?.data) {
      return [];
    }
    return evaluate(jsep(`->${getCssSelectedFileEdgeName(cssEditorProps.data.L[0], cssEditorProps.meta.P.name, state() || "Default", meta.name)}`), { graph, setGraph, vertexes: [cssEditorProps.data] }) || [];
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
    if (!cssEditorProps?.meta || !cssEditorProps?.data) {
      showErrorToast("unable to select file");
      return;
    }

    const selectedFileMetaVertex = {
      IN: {},
      L: [],
      OUT: {},
      P: { type: getCssSelectedFileEdgeName(cssEditorProps.data.L[0], cssEditorProps.meta.P.name, state() || "Default", meta.name) },
      id: "",
    } as Vertex;

    setSelectionValue(txnId, cssEditorProps.data, graph, setGraph, selectedFileMetaVertex, selectedFile.id);

    const currentValue = props.selectedValue();
    if (!currentValue.includes('$1')) {
      const newValue = `url($1)${currentValue ?? ""}`;
      const event = new Event('input', { bubbles: true });
      Object.defineProperty(event, 'target', { value: { value: newValue } });
      props.handleChange(event);
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
        size={16} />
      <CustomModal
        dialogClass="w:90vw r:10px p:0 h:90vh flex flex:column"
        footer={() => (
          <div class="flex ai:center jc:center mt:auto">
            <div class="b:1.5px|solid|lightseagreen ml:auto r:5">
              <button
                class=""
                onClick={onFileSelected}
                type="button"
              >Select</button>
            </div>
          </div>
        )}
        open={openDialog}
        setOpen={setOpenDialog}
        title="File Manager"
      >
        <div>
          <FileManager enableRowSelection={vertex => (vertex as unknown as Vertex).L[0] === "File"} fileId={selectedFileVertex()[0]?.id} setFileManagerStore={setFileManagerStore} />
        </div>
      </CustomModal>
    </>
  );
}
