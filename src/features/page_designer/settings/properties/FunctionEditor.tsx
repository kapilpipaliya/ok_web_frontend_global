import type * as Monaco from "monaco-editor";

import { createEffect, createSignal, on, Show } from "solid-js";
import type { JSX } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import { CustomModal } from "~/components/styled/modal/CustomModal";
import { MonacoEditorWrapper } from "~/components/styled/MonacoEditorWrapper";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import {
  formatCSSCode,
  formatJavaScriptCode,
} from "~/lib/data_structure/string/formatUtils";
import { useGraph } from "~/lib/graph/GraphContext";
import { validateFunction } from "~/lib/validation/validateFunction";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

// import onigasm from 'onigasm/lib/onigasm.wasm?url';

// Shared button styles
const buttonStyles = (args: FunctionArgumentType, color: string) => css`
  padding: 1px 4px;
  background-color: ${color};
  color: ${args.theme.var.color.base_10};
  border-radius: 1px;
  border: none;
`;

// Button components
const EditorButton = (props: {
  onClick: () => void;
  color: string;
  children: JSX.Element;
  title?: string;
}) => (
  <As
    as="button"
    css={(args: FunctionArgumentType) => buttonStyles(args, props.color)}
    onClick={props.onClick}
    title={props.title}
  >
    {props.children}
  </As>
);

export function FunctionEditor(props: {
  keyName?: string;
  label?: string;
  language?: string;
  returnType?: "object" | "string";
  defaultValue?: string;
  setPropertyValue: (meta: Vertex, value: unknown) => void;
}) {
  const [graph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  // Derived state
  const propertyKey = () => props.keyName || "props";
  const getPropertyValue = () => {
    const currentValue =
      graph.vertexes[formStoreVertex()?.P.selectedId]?.P[propertyKey()];

    // If value exists, return it
    if (currentValue !== undefined && currentValue !== null) {
      return currentValue;
    }

    // Use prop defaultValue if provided
    if (props.defaultValue !== undefined) {
      return props.defaultValue;
    }

    // Default values based on keyName
    if (propertyKey() === "css") {
      return `return \`._id {}\`;`;
    } else if (propertyKey() === "fns" || propertyKey() === "props") {
      return "return {}";
    }

    // Fallback to empty string for other cases
    return "";
  };

  // State
  const [isFunctionValid, setIsFunctionValid] = createSignal(true);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [editorValue, setEditorValue] = createSignal(getPropertyValue());

  // Editor reference
  let editorRef: Monaco.editor.IStandaloneCodeEditor | undefined;

  // Update editor value when selected element changes
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

  // Handlers
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
    if (!editorRef) return;

    const model = editorRef.getModel();
    if (!model) return;

    try {
      const language = props.language?.toLowerCase() || "javascript";
      const isJavaScript = [
        "javascript",
        "typescript",
        "js",
        "ts",
        "jsx",
        "tsx",
      ].includes(language);

      if (isJavaScript) {
        model.setValue(await formatJavaScriptCode(model.getValue()));
      } else if (language === "css") {
        model.setValue(await formatCSSCode(model.getValue()));
      } else {
        console.warn(`Formatting not supported for ${language} language`);
      }
    } catch (err) {
      console.error("Formatting failed:", err);
    }
  };

  // UI Components
  const EditorContent = (p: { height?: string }) => (
    <>
      <MonacoEditorWrapper
        error={!isFunctionValid()}
        height={p.height}
        language={props.language || "javascript"}
        onChange={setEditorValue}
        onMount={(_monaco, editor) => (editorRef = editor)}
        showMinimap={false}
        value={editorValue()}
      />
      <As
        as="div"
        css={css`
          display: flex;
          gap: 4px;
          margin-top: 4px;
        `}
      >
        <EditorButton
          color={"${args.theme.var.color.primary}"}
          onClick={handleSave}
        >
          Submit
        </EditorButton>

        <EditorButton
          color={"${args.theme.var.color.secondary_70}"}
          onClick={formatCode}
          title="Format Code with Prettier"
        >
          Format
        </EditorButton>

        <Show when={isModalOpen()}>
          <As as="div" css={css`margin-left: auto;`}>
            <EditorButton
              color={"${args.theme.var.color.error_200}"}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </EditorButton>
          </As>
        </Show>
      </As>

      <Show when={!isFunctionValid()}>
        <As
          as="span"
          css={css`
  color: \${args.theme.var.color.error};
`}
        >
          Invalid Function
        </As>
      </Show>
    </>
  );

  return (
    <>
      <As as="div" css={css`margin-top: 5px;`}>
        <As as="span" css={css`display: flex; align-items: center;`}>
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
