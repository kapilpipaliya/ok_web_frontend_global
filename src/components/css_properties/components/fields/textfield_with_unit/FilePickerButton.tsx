import { type Accessor, createMemo, createSignal, type JSX } from "solid-js";

import type { TextFieldOptionsField } from "~/components/css_properties/constants/FieldSchemaType";
import type { FileManagerObject } from "~/pages/file_manager/FileManagerContext";

import { useCssEditorProps } from "~/components/css_properties/context/CSSEditorPropsContext";
import { useCssState } from "~/components/css_properties/context/CssStateContext";
import { useRenderContext } from "~/components/css_properties/context/RenderContext";
import { getCssSelectedFileEdgeName } from "~/components/css_properties/utils/getCssSelectedFileEdgeName";
import { CustomModal } from "~/components/CustomModal";
import { useFormContext } from "~/components/form/FormContext";
import { IconButton } from "~/components/IconButton";
import { useToast } from "~/components/Toast";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";
import FileManager from "~/pages/file_manager/FileManager";

interface FilePickerButtonProps
  extends JSX.InputHTMLAttributes<HTMLInputElement> {
  handleChange: (event: Event) => void;
  value: string;
}
export function FilePickerButton(props: Readonly<FilePickerButtonProps>) {
  const [openDialog, setOpenDialog] = createSignal(false);
  const [graph, setGraph] = useGraph();
  let fileManagerStore: FileManagerObject;
  const [parentItems] = useRenderContext();
  const meta = getLastItem(
    parentItems?.meta || [],
  ) as Accessor<TextFieldOptionsField>;
  const cssEditorProps = useCssEditorProps();
  const [formStore] = useFormContext();
  const { showErrorToast } = useToast();
  const [state] = useCssState();

  const selectedFileVertex = createMemo((): Vertex[] => {
    if (!(cssEditorProps?.meta && cssEditorProps?.data)) {
      return [];
    }
    return (
      evalExpression(
        `->${getCssSelectedFileEdgeName(cssEditorProps.data.L[0], cssEditorProps.meta.P.key, state() || "Default", meta().key)}`,
        { graph, setGraph, vertexes: [cssEditorProps.data] },
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
    if (!(cssEditorProps?.meta && cssEditorProps?.data)) {
      showErrorToast("unable to select file");
      return;
    }

    const selectedFileMetaVertex = {
      id: "",
      IN: {},
      L: [],
      OUT: {},
      P: {
        type: getCssSelectedFileEdgeName(
          cssEditorProps.data.L[0],
          cssEditorProps.meta.P.key,
          state() || "Default",
          meta().key,
        ),
      },
    } as Vertex;

    setSelectionValue(
      txnId,
      cssEditorProps.data,
      graph,
      setGraph,
      selectedFileMetaVertex,
      selectedFile.id,
    );

    if (!props.value.includes("$1")) {
      const newValue = `url($1)${props.value ?? ""}`;
      const event = new Event("input", { bubbles: true });
      Object.defineProperty(event, "target", { value: { value: newValue } });
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
        size={16}
      />
      <CustomModal
        dialogClass="w:90vw r:10px p:0 h:90vh flex flex:column"
        footer={() => (
          <div class="flex ai:center jc:center mt:auto">
            <div class="b:1.5px|solid|lightseagreen ml:auto r:5">
              <button class="" onClick={onFileSelected} type="button">
                Select
              </button>
            </div>
          </div>
        )}
        open={openDialog}
        setOpen={setOpenDialog}
        title="File Manager"
      >
        <div>
          <FileManager
            enableRowSelection={(vertex) =>
              (vertex as unknown as Vertex).L[0] === "File"
            }
            fileId={selectedFileVertex()[0]?.id}
            parentVertexLabel="Folder"
            setFileManagerStore={setFileManagerStore}
            toParentEdgeType="ParentFolder"
          />
        </div>
      </CustomModal>
    </>
  );
}
