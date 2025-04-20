import type * as Monaco from "monaco-editor";

import { createEffect, createSignal, on } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import { CustomModal } from "~/components/styled/modal/CustomModal";
import { MonacoEditorWrapper } from "~/components/styled/MonacoEditorWrapper";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { formatCSSCode, formatJavaScriptCode } from "~/lib/data_structure/string/formatUtils";
import { useGraph } from "~/lib/graph/GraphContext";
import { validateFunction } from "~/lib/validation/validateFunction";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

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
          // Only format JavaScript content, not CSS
          const language = props.language?.toLowerCase() || "javascript";
          if (language === "javascript" || language === "typescript" || 
              language === "js" || language === "ts" || 
              language === "jsx" || language === "tsx") {
            const formatted = await formatJavaScriptCode(model.getValue());
            model.setValue(formatted);
          } else if (language === "css") {
            const formatted = await formatCSSCode(model.getValue());
            model.setValue(formatted);
          } else {
            console.warn(`Formatting not supported for ${language} language`);
          }
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
        onMount={(_monaco, editor) => (editorRef = editor)}
        showMinimap={false}
        value={editorValue()}
      />
      <As
        as="div"
        css={css`
  display: flex;
  gap: 3px;
  margin-top: 2px;
`}
      >
        <As
          as="button"
          css={(args: FunctionArgumentType) => css`
  padding-left: 3px;
  padding-right: 3px;
  padding-top: 1px;
  padding-bottom: 1px;
  background-color: ${args.theme.var.color.primary};
  color: ${args.theme.var.color.base_10};
  border-radius: 1px;
  border: none;
`}
          onClick={handleSave}
        >
          Submit
        </As>
        <As
          as="button"
          css={(args: FunctionArgumentType) => css`
  padding-left: 3px;
  padding-right: 3px;
  padding-top: 1px;
  padding-bottom: 1px;
  background-color: ${args.theme.var.color.secondary_70};
  color: ${args.theme.var.color.base_10};
  border-radius: 1px;
  border: none;
`}
          onClick={formatCode}
          title="Format Code with Prettier"
        >
          Format
        </As>
      </As>
      {!isFunctionValid() && (
        <As
          as="span"
          css={css`
  color: \${args.theme.var.color.error};
`}
        >
          Invalid Function
        </As>
      )}
    </>
  );

  return (
    <>
      <As
        as="div"
        css={css`
  margin-top: 5px;
`}
      >
        <As
          as="span"
          css={css`
  display: flex;
  align-items: center;
`}
        >
          {props.label}
          <IconButton
            css={css`
  margin-left: 6px;
  background-color: transparent;
  border: none;
`}
            icon="ph:arrow-square-out"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            title="Edit Function in Modal"
          />
        </As>
        <EditorContent height="200px" />
      </As>
      <CustomModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        title={`Edit ${props.label}`}
      >
        <As
          as="div"
          css={css`
  padding: 3px;
  width: 600px;
  height: 600px;
`}
        >
          <EditorContent height="560px" />
        </As>
      </CustomModal>
    </>
  );
}
