import type * as Monaco from "monaco-editor";

import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { MonacoEditor } from "solid-monaco";
// import onigasm from 'onigasm/lib/onigasm.wasm?url';

import { PROPERTIES } from "./constants/constant";

// Initialize Monaco workers if not already done
if (!window.MonacoEnvironment) {
  window.MonacoEnvironment = {
    getWorker(_moduleId: unknown, label: string) {
      switch (label) {
        case "css":
          return new cssWorker();
        case "javascript":
        case "typescript":
          return new tsWorker();
        case "json":
          return new jsonWorker();
        default:
          return new editorWorker();
      }
    },
    // onigasm,
  };
}

export interface MonacoEditorWrapperProps {
  error?: boolean;
  height?: string;
  language?: string;
  onChange: (value: string) => void;
  onMount?: (editor: typeof Monaco) => void;
  showMinimap?: boolean;
  value: string;
}

export function MonacoEditorWrapper(props: Readonly<MonacoEditorWrapperProps>) {
  return (
    <MonacoEditor
      class={`${PROPERTIES.Css.TextField} ${props.error ? "b:error" : ""}`}
      height={props.height ?? "200px"}
      language={props.language ?? "javascript"}
      onChange={(value) => props.onChange(value)}
      onMount={(editor) => props.onMount?.(editor)}
      options={{
        autoIndent: "full",
        folding: false,
        formatOnPaste: true,
        formatOnType: true,
        glyphMargin: false,
        lineDecorationsWidth: 0,
        lineNumbers: "off",
        lineNumbersMinChars: 0,
        minimap: { enabled: props.showMinimap ?? false },
        tabSize: 2,
      }}
      value={props.value}
    />
  );
}
export default MonacoEditorWrapper;