import type * as Monaco from "monaco-editor";

import { MonacoEditor } from "solid-monaco";
import { createMemo, createSignal, onMount, Show } from "solid-js";
import { useThemeMode } from "~/lib/theme/useThemeMode";
import { ensureEditorVisibleAboveKeyboard } from "~/lib/hooks/ensureEditorVisibleAboveKeyboard";

// import onigasm from 'onigasm/lib/onigasm.wasm?url';
import { PROPERTIES } from "~/pages/settings/constants";
import { As } from "../As";

let monacoWorkersPromise: Promise<void> | undefined;

/** Load Monaco workers only when an editor mounts (keeps ~9MB workers off public pages). */
function ensureMonacoWorkers(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  if (window.MonacoEnvironment) {
    return Promise.resolve();
  }
  if (!monacoWorkersPromise) {
    // Monaco 0.56+ remaps exports: use monaco-editor/<path> (not esm/vs/...)
    monacoWorkersPromise = Promise.all([
      import("monaco-editor/editor/editor.worker.js?worker"),
      import("monaco-editor/language/css/css.worker.js?worker"),
      import("monaco-editor/language/json/json.worker.js?worker"),
      import("monaco-editor/language/typescript/ts.worker.js?worker"),
    ]).then(([editorWorker, cssWorker, jsonWorker, tsWorker]) => {
      window.MonacoEnvironment = {
        getWorker(_moduleId: unknown, label: string) {
          switch (label) {
            case "css":
              return new cssWorker.default();
            case "javascript":
            case "typescript":
              return new tsWorker.default();
            case "json":
              return new jsonWorker.default();
            default:
              return new editorWorker.default();
          }
        },
        // onigasm,
      };
    });
  }
  return monacoWorkersPromise;
}

export interface MonacoEditorWrapperProps {
  error?: boolean;
  height?: string;
  language?: string;
  onChange: (value: string) => void;
  onMount?: (
    monaco: typeof Monaco,
    editor: Monaco.editor.IStandaloneCodeEditor,
  ) => void;
  showMinimap?: boolean;
  value: string;
}

export function MonacoEditorWrapper(props: Readonly<MonacoEditorWrapperProps>) {
  const themeMode = useThemeMode();
  const [workersReady, setWorkersReady] = createSignal(false);

  onMount(() => {
    ensureMonacoWorkers()
      .then(() => setWorkersReady(true))
      .catch((error) => {
        console.error("Failed to load Monaco workers:", error);
      });
  });

  const theme = createMemo(() => {
    return themeMode() === "dark" ? "vs-dark" : "vs";
  });

  // Flag to track if we've initialized our extensions
  let extensionsInitialized = false;
  // Handle editor mount and setup custom language extensions if needed
  const handleEditorMount = (
    monaco: typeof Monaco,
    editor: Monaco.editor.IStandaloneCodeEditor,
  ) => {
    // Initialize extensions only once
    if (!extensionsInitialized) {
      extensionsInitialized = true;
    }

    // Call the original onMount handler
    props.onMount?.(monaco, editor);

    // On Android the soft keyboard covers Monaco unless we scroll it into view.
    editor.onDidFocusEditorWidget(() => {
      const node = editor.getDomNode();
      if (node) {
        ensureEditorVisibleAboveKeyboard(node);
      }
    });
  };

  return (
    <Show when={workersReady()}>
      <As
        as={MonacoEditor}
        css={[
          PROPERTIES.Css.TextFieldCss,
          `return \`._id {
          ${props.error ? "b: error" : ""}
        }\`;`,
        ]}
        height={props.height ?? "200px"}
        language={props.language}
        onChange={(value: string) => props.onChange(value)}
        onMount={handleEditorMount}
        options={{
          autoIndent: "full",
          theme: theme(),
          folding: false,
          fontSize: 14,
          formatOnPaste: true,
          formatOnType: true,
          glyphMargin: false,
          lineDecorationsWidth: 0,
          lineNumbers: "off",
          lineNumbersMinChars: 0,
          minimap: { enabled: props.showMinimap ?? false },
          scrollbar: {
            // https://github.com/kubernetes-sigs/kui/issues/6480
            alwaysConsumeMouseWheel: false,
            horizontalScrollbarSize: 5,
            verticalScrollbarSize: 5,
            horizontal: "auto",
            vertical: "auto",
            handleMouseWheel: true,
            scrollByPage: false,
          },
          scrollBeyondLastLine: false,
          tabSize: 2,
        }}
        value={props.value}
      />
    </Show>
  );
}
