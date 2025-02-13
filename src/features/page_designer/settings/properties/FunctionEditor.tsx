import type * as Monaco from "monaco-editor";

import { createEffect, createSignal, on } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { PROPERTIES } from "~/components/styled/constants/constant";
import { CustomModal } from "~/components/styled/CustomModal";
import { IconButton } from "~/components/styled/IconButton";
import { MonacoEditorWrapper } from "~/components/styled/MonacoEditorWrapper";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { formatJavaScriptCode } from "~/lib/data_structure/string/formatUtils";
import { useGraph, type Vertex } from "~/lib/graph/graph";
// import onigasm from 'onigasm/lib/onigasm.wasm?url';

export function FunctionEditor(props: {
  setPropertyValue: (meta: Vertex, value: unknown) => void;
}) {
  const [graph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const [isFunctionValid, setIsFunctionValid] = createSignal(true);
  const getOtherProps = () =>
    graph.vertexes[formStoreVertex()?.P.selectedId].P.props ?? "";
  const [editorValue, setEditorValue] = createSignal(getOtherProps());
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  let editorRef: Monaco.editor.IStandaloneCodeEditor | undefined;

  createEffect(
    on(
      () => formStoreVertex()?.P.selectedId,
      () => {
        if (formStoreVertex()?.P.selectedId !== -1) {
          setIsFunctionValid(true);
          setEditorValue(getOtherProps());
        }
      },
      { defer: true },
    ),
  );

  const evaluateOtherProps = (value: string) => {
    try {
      if (!value) {
        setIsFunctionValid(true);
        props.setPropertyValue(
          { P: { key: "props" } } as unknown as Vertex,
          value,
        );
        return;
      }

      if (!value.includes("return {")) {
        throw new Error("Function must return an object");
      }

      setIsFunctionValid(true);
      props.setPropertyValue(
        { P: { key: "props" } } as unknown as Vertex,
        value,
      );

      /* Original validation code:
      const func = new Function("args", `${value}`);
      if (typeof func === "function") {
        const result = func({});
        if (typeof result === "object") {
          setIsFunctionValid(true);
          props.setPropertyValue(
            { P: { key: "props" } } as unknown as Vertex,
            value,
          );
        } else {
          throw new Error("Function did not return an object");
        }
      } else {
        throw new Error("Input is not a function");
      }
      */
    } catch (error) {
      console.error("Error evaluating function:", error);
      setIsFunctionValid(false);
    }
  };

  const handleSave = () => {
    evaluateOtherProps(editorValue());
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

  const EditorContent = (props: { height?: string }) => (
    <>
      <MonacoEditorWrapper
        error={!isFunctionValid()}
        height={props.height}
        onChange={(value) => setEditorValue(value)}
        onMount={(editor) => (editorRef = editor)}
        showMinimap={false}
        value={editorValue()}
      />
      <div class="flex gap:2 mt:2">
        <button class="px:3 py:1 bg:primary-60 fg:base-5 r:1" onClick={handleSave}>
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
          Props Function
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
        title="Edit Props Function"
      >
        <div class="p:3 width:600px height:600px">
          <EditorContent height="560px" />
        </div>
      </CustomModal>
    </>
  );
}
