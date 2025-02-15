import { createMemo, createSignal, type JSX } from "solid-js";

import type { TextFieldOptionsField } from "~/components/css_properties/constants/FieldSchemaType";
import type { FileManagerObject } from "~/features/file_manager/FileManagerContext";

import { useCssEditorProps } from "~/components/css_properties/context/CSSEditorPropsContext";
import { useCssState } from "~/components/css_properties/context/CssStateContext";
import { useRenderContext } from "~/components/css_properties/context/RenderContext";
import { getCssSelectedFileEdgeName } from "~/components/css_properties/utils/getCssSelectedFileEdgeName";
import {
  type FormStoreObject,
  useFormContext,
} from "~/components/form/context/FormContext";
import { IconButton } from "~/components/styled/IconButton";
import { useToast } from "~/components/styled/Toast";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { evalExpression } from "~/lib/expression_eval";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { setSelectionValue } from "~/lib/graph/mutate/setSelectionValue";

import { FilePickerModal } from "./FilePickerModal";

interface FilePickerButtonProps
  extends JSX.InputHTMLAttributes<HTMLInputElement> {
  handleChange: (event: Event) => void;
  value: string;
}

export function FilePickerButton(props: Readonly<FilePickerButtonProps>) {
  const [openDialog, setOpenDialog] = createSignal(false);
  const [graph, setGraph] = useGraph();
  let fileManagerStore: FileManagerObject;
  const parentItems = useRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () =>
    parentRenderContext()?.context.meta as unknown as TextFieldOptionsField;
  const cssEditorProps = useCssEditorProps();
  const formId = useFormContext();
  const formVertex = () => graph.vertexes[formId!] as Vertex<FormStoreObject>;
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
    const txnId = formVertex()?.P?.txnId;
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

    if (!(props.value ?? "").includes("$1")) {
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
        class={selectedFileVertex()?.length > 0 ? "color:green" : ""}
        icon={"ph:image-square"}
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
