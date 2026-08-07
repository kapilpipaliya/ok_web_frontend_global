import type * as Monaco from "monaco-editor";

import { createEffect, createSignal, For, on, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { CustomModal } from "~/components/styled/modal/CustomModal";
import { MonacoEditorWrapper } from "~/components/styled/MonacoEditorWrapper";
// Intentionally not using ~/lib/resizable (DesignerResizeHandle): Monaco needs an
// explicit pixel height, handles overlay the editor edges without grid tracks, and
// useVerticalResize keeps auto-height + manual resize in sync when content changes.
import {
  bottomResizeHandleStyles,
  resizeContainerStyles,
  topResizeHandleStyles,
} from "~/components/styled/resizeHandleStyles";
import {
  type PageLayoutObject,
  useDesignerFormIdContext,
  useDesignerLayoutStore,
} from "~/features/page_designer/context/LayoutContext";
import {
  formatCSSCode,
  formatJavaScriptCode,
} from "~/lib/data_structure/string/formatUtils";
import { useVerticalResize } from "~/lib/hooks/useVerticalResize";
import { validateFunction } from "~/lib/validation/validateFunction";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { Id } from "~/lib/graph/type/id";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function FunctionEditor(props: {
  keyName?: string;
  label?: string;
  language?: string;
  returnType?: "object" | "string";
  defaultValue?: string;
  setPropertyValue: (meta: Vertex, value: unknown) => void;
  vertexId?: Id;
}) {
  const [graph] = useGraph();
  const formStoreId = useDesignerFormIdContext();
  const layoutStoreId = useDesignerLayoutStore();
  const isResizingDisabled = () =>
    !!(graph.vertexes[layoutStoreId]?.P as PageLayoutObject | undefined)
      ?.isResizingDisabled;
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const targetVertexId = () =>
    props.vertexId ?? formStoreVertex()?.P.selectedId;

  const propertyKey = () => props.keyName || "props";
  const getPropertyValue = () => {
    const currentValue = graph.vertexes[targetVertexId()]?.P[propertyKey()];

    if (currentValue !== undefined && currentValue !== null) {
      return currentValue;
    }

    if (props.defaultValue !== undefined) {
      return props.defaultValue;
    }

    if (propertyKey() === "css") {
      return "return `._id {\n  \n}`;";
    }
    if (propertyKey() === "fns" || propertyKey() === "props") {
      return "return {\n  \n}";
    }

    return "";
  };

  const [isFunctionValid, setIsFunctionValid] = createSignal(true);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [editorValue, setEditorValue] = createSignal(getPropertyValue());
  const [originalValue, setOriginalValue] = createSignal(getPropertyValue());
  const [hasChanges, setHasChanges] = createSignal(false);

  let editorRef: Monaco.editor.IStandaloneCodeEditor | undefined;

  const runEditorAction = (actionId: string) => {
    editorRef?.focus();
    editorRef?.getAction(actionId)?.run();
  };

  const getEditorSelectionText = () => {
    const editor = editorRef;
    const model = editor?.getModel();
    const selection = editor?.getSelection();
    if (!(editor && model && selection) || selection.isEmpty()) {
      return null;
    }

    const text = model.getValueInRange(selection);
    return text ? { editor, model, selection, text } : null;
  };

  const writeClipboardText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    }
  };

  const cutSelection = async () => {
    const selectionData = getEditorSelectionText();
    if (!selectionData) {
      return;
    }

    const { editor, model, selection, text } = selectionData;
    const copied = await writeClipboardText(text);
    if (!copied) {
      return;
    }

    editor.pushUndoStop();
    editor.executeEdits("toolbar-cut", [
      { range: selection, text: "", forceMoveMarkers: true },
    ]);
    handleEditorChange(model.getValue());
  };

  const copySelection = async () => {
    const selectionData = getEditorSelectionText();
    if (!selectionData) {
      return;
    }

    await writeClipboardText(selectionData.text);
  };

  const pasteFromClipboard = async () => {
    const editor = editorRef;
    if (!editor) {
      return;
    }

    let text = "";
    try {
      text = await navigator.clipboard.readText();
    } catch {
      return;
    }

    const selection = editor.getSelection();
    if (!selection) {
      return;
    }

    editor.pushUndoStop();
    editor.executeEdits("toolbar-paste", [
      { range: selection, text, forceMoveMarkers: true },
    ]);

    const model = editor.getModel();
    if (model) {
      handleEditorChange(model.getValue());
    }
  };

  const toolbarActions = [
    {
      icon: "ph:arrow-counter-clockwise",
      title: "Undo",
      onClick: () => {
        editorRef?.focus();
        editorRef?.trigger("toolbar", "undo", null);
      },
    },
    {
      icon: "ph:arrow-clockwise",
      title: "Redo",
      onClick: () => {
        editorRef?.focus();
        editorRef?.trigger("toolbar", "redo", null);
      },
    },
    {
      icon: "ph:magnifying-glass",
      title: "Find",
      onClick: () => runEditorAction("actions.find"),
    },
    {
      icon: "ph:copy-simple",
      title: "Copy",
      onClick: () => void copySelection(),
    },
    {
      icon: "ph:scissors",
      title: "Cut",
      onClick: () => void cutSelection(),
    },
    {
      icon: "ph:clipboard",
      title: "Paste",
      onClick: () => void pasteFromClipboard(),
    },
  ] as const;

  const handleToolbarPointerDown = (event: PointerEvent) => {
    event.preventDefault();
  };

  createEffect(
    on(
      () => {
        const vertexId = targetVertexId();
        const propertyValue =
          vertexId !== -1 && vertexId !== undefined
            ? graph.vertexes[vertexId]?.P[propertyKey()]
            : undefined;
        return { vertexId, propertyValue };
      },
      ({ vertexId }) => {
        if (vertexId !== -1 && vertexId !== undefined) {
          const newValue = getPropertyValue();
          setIsFunctionValid(true);
          setEditorValue(newValue);
          setOriginalValue(newValue);
          setHasChanges(false);

          if (editorRef) {
            const model = editorRef.getModel();
            if (model && model.getValue() !== newValue) {
              model.setValue(newValue);
            }
          }
        }
      },
      { defer: true },
    ),
  );

  const handleEditorChange = (value: string) => {
    setEditorValue(value);
    setHasChanges(value !== originalValue());
  };

  const evaluateProperty = (value: string) => {
    const validation = validateFunction(value, props.returnType);
    setIsFunctionValid(validation.isValid);

    if (validation.isValid) {
      props.setPropertyValue(
        { P: { key: propertyKey() } } as unknown as Vertex,
        value,
      );
      setOriginalValue(value);
      setHasChanges(false);
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
    if (!editorRef) {
      return;
    }

    const model = editorRef.getModel();
    if (!model) {
      return;
    }

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
        const formatted = await formatJavaScriptCode(model.getValue());
        model.setValue(formatted);
        setHasChanges(formatted !== originalValue());
      } else if (language === "css") {
        const formatted = await formatCSSCode(model.getValue());
        model.setValue(formatted);
        setHasChanges(formatted !== originalValue());
      } else {
        console.warn(`Formatting not supported for ${language} language`);
      }
    } catch (err) {
      console.error("Formatting failed:", err);
    }
  };

  const EditorContent = (p: { maxHeight?: string }) => {
    const calculateAutoHeight = () => {
      const lines = editorValue().split("\n").length;
      const lineHeight = 19;
      const padding = 40;
      const minHeight = 100;
      const maxHeight = p.maxHeight ? Number.parseInt(p.maxHeight) : 400;

      const calculatedHeight = Math.min(
        Math.max(lines * lineHeight + padding, minHeight),
        maxHeight,
      );
      return `${calculatedHeight}px`;
    };

    const autoHeight = () => calculateAutoHeight();
    const resize = useVerticalResize({
      initialHeight: autoHeight,
      autoHeight,
    });

    createEffect(() => {
      editorValue();
      if (!isModalOpen()) {
        resize.resetManualHeight();
      }
    });

    return (
      <As
        as="div"
        css={`return \`._id {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }\`;`}
      >
        <As as="div" css={resizeContainerStyles}>
          <Show when={!isResizingDisabled()}>
            <As
              as="div"
              css={topResizeHandleStyles}
              onPointerDown={resize.onTopPointerDown}
            />
          </Show>
          <MonacoEditorWrapper
            error={!isFunctionValid()}
            height={resize.height()}
            language={props.language || "javascript"}
            onChange={handleEditorChange}
            onMount={(_monaco, editor) => (editorRef = editor)}
            showMinimap={false}
            value={editorValue()}
          />
          <Show when={!isResizingDisabled()}>
            <As
              as="div"
              css={bottomResizeHandleStyles}
              onPointerDown={resize.onBottomPointerDown}
            />
          </Show>
        </As>

        <Show when={!isFunctionValid()}>
          <As
            as="span"
            css={`return \`._id {
              color: \${t.var.color.error};
            }\`;`}
          >
            Invalid Function
          </As>
        </Show>
      </As>
    );
  };

  return (
    <>
      <As as="div" css={"return `._id { margin-top: 5px; }`;"}>
        <As
          as="div"
          css={`return \`._id {
            display: flex;
            align-items: center;
            gap: 4px;
            flex-wrap: wrap;
            margin-bottom: 4px;
          }\`;`}
        >
          <As
            as="span"
            css={`return \`._id {
              font-weight: 500;
              font-size: 0.875rem;
              margin-right: 4px;
            }\`;`}
          >
            {props.label}
          </As>

          <As
            as="div"
            css={`return \`._id {
              display: flex;
              align-items: center;
              gap: 2px;
            }\`;`}
          >
            <For each={toolbarActions}>
              {(action) => (
                <IconButton
                  css={`return \`._id {
                    background-color: transparent;
                    border: none;
                    padding: 2px;
                  }\`;`}
                  icon={action.icon}
                  onClick={action.onClick}
                  onPointerDown={handleToolbarPointerDown}
                  size={16}
                  title={action.title}
                />
              )}
            </For>
          </As>

          <As
            as="div"
            css={`return \`._id {
              display: flex;
              align-items: center;
              gap: 4px;
              margin-left: auto;
            }\`;`}
          >
            <IconButton
              css={`return \`._id {
                padding: 2px;
                background-color: \${t.var.color.success};
                color: \${t.var.color.success_text};
                border: none;
                border-radius: 2px;

                &:disabled {
                  opacity: 0.5;
                  cursor: not-allowed;
                }
              }\`;`}
              disabled={!hasChanges()}
              icon="ph:check"
              onClick={handleSave}
              size={16}
              title="Submit"
            />

            <IconButton
              css={`return \`._id {
                padding: 2px;
                background-color: \${t.var.color.primary_light_300};
                color: \${t.var.color.primary_light_300_text};
                border: none;
                border-radius: 2px;
              }\`;`}
              icon="ph:magic-wand"
              onClick={formatCode}
              size={16}
              title="Format Code with Prettier"
            />

            <IconButton
              css={`return \`._id {
                background-color: transparent;
                border: none;
              }\`;`}
              icon="ph:arrow-square-out"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              size={16}
              title="Edit Function in Modal"
            />
          </As>
        </As>

        <EditorContent />
      </As>

      <CustomModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        title={`Edit ${props.label}`}
      >
        <As
          as="div"
          css={`return \`._id {
            padding: 3px;
            width: 600px;
            height: 600px;
          }\`;`}
        >
          <EditorContent maxHeight="560px" />
        </As>
      </CustomModal>
    </>
  );
}
