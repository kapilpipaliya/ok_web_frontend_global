import type * as Monaco from "monaco-editor";

import { createEffect, createSignal, on } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import { CustomModal } from "~/components/styled/modal/CustomModal";
import { MonacoEditorWrapper } from "~/components/styled/MonacoEditorWrapper";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { formatJavaScriptCode } from "~/lib/data_structure/string/formatUtils";
import { useGraph } from "~/lib/graph/GraphContext";
import { validateFunction } from "~/lib/validation/validateFunction";

// import onigasm from 'onigasm/lib/onigasm.wasm?url';

export function FunctionEditor(props: {
  keyName?: string;
  label?: string;
  language?: string;
  returnType?: "object" | "string";
  setPropertyValue: (meta: Vertex, value: unknown) => void;
}) {
  const [graph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const [isFunctionValid, setIsFunctionValid] = createSignal(true);
  const propertyKey = () => props.keyName || "props";
  const getPropertyValue = () =>
    graph.vertexes[formStoreVertex()?.P.selectedId].P[propertyKey()] ?? "";
  const [editorValue, setEditorValue] = createSignal(getPropertyValue());
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  let editorRef: Monaco.editor.IStandaloneCodeEditor | undefined;

  createEffect(
    on(
      () => formStoreVertex()?.P.selectedId,
      () => {
        if (formStoreVertex()?.P.selectedId !== -1) {
          setIsFunctionValid(true);
          setEditorValue(getPropertyValue());
        }
      },
      { defer: true },
    ),
  );

  const evaluateProperty = (value: string) => {
    const validation = validateFunction(value, props.returnType);
    setIsFunctionValid(validation.isValid);

    if (validation.isValid) {
      props.setPropertyValue(
        { P: { key: propertyKey() } } as unknown as Vertex,
        value,
      );
    } else {
      console.error("Function validation error:", validation.error);
    }
  };

  const handleSave = () => {
    evaluateProperty(editorValue());
    if (isFunctionValid()) {
      setIsModalOpen(false);
    }
  };

  const formatCode = async () => {
    if (editorRef) {
      const model = editorRef.getModel();
      if (model) {
        try {
          const formatted = await formatJavaScriptCode(model.getValue());
          model.setValue(formatted);
        } catch (err) {
          console.error("Formatting failed:", err);
        }
      }
    }
  };

  const EditorContent = (p: { height?: string }) => (
    <>
      <MonacoEditorWrapper
        error={!isFunctionValid()}
        height={p.height}
        language={props.language || "javascript"}
        onChange={(value) => setEditorValue(value)}
        onMount={(editor) => (editorRef = editor)}
        showMinimap={false}
        value={editorValue()}
      />
      <div class="flex gap:2 mt:2">
        <button
          class="px:3 py:1 bg:primary-60 fg:base-5 r:1"
          onClick={handleSave}
        >
          Submit
        </button>
        <button
          class="px:3 py:1 bg:gray-60 fg:base-5 r:1"
          onClick={formatCode}
          title="Format Code with Prettier"
        >
          Format
        </button>
      </div>
      {!isFunctionValid() && <span class="fg:error">Invalid Function</span>}
    </>
  );

  return (
    <>
      <div class="mt:5">
        <span class="flex ai:center">
          {props.label}
          <IconButton
            class="ml:6"
            icon="ph:arrow-square-out"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            title="Edit Function in Modal"
          />
        </span>
        <EditorContent height="200px" />
      </div>
      <CustomModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        title={`Edit ${props.label}`}
      >
        <div class="p:3 width:600px height:600px">
          <EditorContent height="560px" />
        </div>
      </CustomModal>
    </>
  );
}
