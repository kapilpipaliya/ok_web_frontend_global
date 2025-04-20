import { useChat } from "@ai-sdk/solid";
import { createMemo, createSignal, For, onMount, Show } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";
import type { Vertex } from "~/lib/graph/graph";

import { insertNewRow } from "~/components/fields/table_field/functions/insertNewRow";
import { getGlobalThemeVertex } from "~/lib/graph/get/sync/store/getGlobalThemeVertex";
import { themeConfig } from "~/lib/graph/get/sync/theme/themeConfig";
import { useGraph } from "~/lib/graph/GraphContext";
import { deleteRow } from "~/lib/graph/mutate/vertex/delete/deleteRow";
import { STYLES } from "~/pages/settings/constants";

import type { DBMessage } from "./types";

import {
  type PageLayoutObject,
  useDesignerLayoutStore,
} from "../../context/LayoutContext";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { ChatResponse } from "./ChatResponse";
import { EXAMPLE_PROMPTS } from "./constants/EXAMPLE_PROMPTS";
import { getChatHistory } from "./functions/getChatHistory";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function UseObjectAIPanel() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () =>
    graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;

  const formStoreVertex = () =>
    layoutStoreVertex().P.mainFormId
      ? (graph.vertexes[
          layoutStoreVertex().P.mainFormId!
        ] as Vertex<FormStoreObject>)
      : undefined;
  const messages = createMemo(() =>
    getChatHistory(graph, setGraph, formStoreVertex),
  );

  const [showExamples, setShowExamples] = createSignal(false);
  const [files, setFiles] = createSignal<FileList | undefined>(undefined);
  const [lastRequestPrompt, setLastRequestPrompt] = createSignal<string>("");
  const [lastSelectedModel, setLastSelectedModel] = createSignal<string>("");

  let chatHistoryRef: HTMLDivElement | undefined;
  let examplesButtonRef: HTMLButtonElement | undefined;
  let fileInputRef: HTMLInputElement | undefined;

  const globalTheme = themeConfig(getGlobalThemeVertex(graph));

  // Add onMount to scroll to bottom initially
  onMount(() => {
    if (chatHistoryRef) {
      setTimeout(() => {
        chatHistoryRef.scrollTop = chatHistoryRef.scrollHeight;
      }, 1500);
    }
  });

  const {
    error,
    handleInputChange,
    handleSubmit,
    input,
    isLoading,
    messages: chatMessages,
    reload,
    setMessages,
    stop,
  } = useChat({
    onFinish(message) {
      const content = message.content;
      let data: unknown[] = [];

      // Try to parse the entire content as JSON array first
      try {
        const parsed = JSON.parse(content);
        data = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // If that fails, try to find JSON code blocks
        const jsonMatches = [...content.matchAll(/```json\n([\s\S]*?)\n```/g)];
        if (jsonMatches.length > 0) {
          try {
            const parsed = JSON.parse(jsonMatches[0][1]);
            data = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            // If JSON parsing fails, leave data as empty array
          }
        }
      }

      // Create content preview from first 100 characters
      const contentPreview =
        content.slice(0, 100) + (content.length > 100 ? "..." : "");

      const messageData = {
        contentPreview,
        data: JSON.stringify(data),
        hasFile: !!files(),
        model: lastSelectedModel(),
        prompt: lastRequestPrompt(),
        response: content,
        timestamp: Date.now(),
        // Removing attachments from DB storage
        // attachments: files() ? Array.from(files()!) : undefined
      } as DBMessage;

      if (!formStoreVertex()) {
        return;
      }

      insertNewRow(
        formStoreVertex()!.P.txnId,
        { P: { type: "ChatHistory" } } as unknown as Vertex,
        graph.vertexes[formStoreVertex()!.P.formDataId!],
        false,
        graph,
        setGraph,
        messageData,
      );

      setTimeout(() => {
        if (chatHistoryRef) {
          chatHistoryRef.scrollTop = chatHistoryRef.scrollHeight;
        }
      }, 0);

      if (!error()) {
        // clear input and files on successful completion
        // @ts-expect-error ignore error
        handleInputChange({ target: { value: "" } });
        setFiles(undefined);
        if (fileInputRef) {
          fileInputRef.value = "";
        }
      }
    },
    onResponse() {},
  });

  const handleChatSubmit = (e: SubmitEvent, model: string) => {
    e.preventDefault();
    if (!input().trim() || isLoading()) {
      return;
    }

    setLastRequestPrompt(input());
    setLastSelectedModel(model);
    handleSubmit(e, {
      body: {
        extraMessages: [
          {
            content: `
You are a designer.
You have access to the following theme color variables:
\`\`\`json
${JSON.stringify(globalTheme)}
\`\`\`
you can use above theme variables in css properties, dont use css variables like 'var(--color-primary)'.

Choose colors that work well for the context and maintain good contrast ratios.
`.trim(),
            role: "system",
          },
        ],
        model: model,
      },
      experimental_attachments: files(),
    });

    setTimeout(() => {
      if (chatHistoryRef) {
        chatHistoryRef.scrollTop = chatHistoryRef.scrollHeight;
      }
    }, 0);
  };

  const handleExampleClick = (example: string) => {
    // @ts-expect-error ignore error
    handleInputChange({ target: { value: example } });
    setShowExamples(false);
  };

  return (
    <As
      as="div"
      css={css`
  display: grid;
  grid-template-rows: 1fr auto;
  height: 100%;
`}
    >
      <As
        as="div"
        css={[STYLES.overflowCss]}
        class="chat-history"
        ref={chatHistoryRef!}
      >
        <For each={messages()}>
          {(message, index) => (
            <As
              as="div"
              css={[
                css`
  margin-bottom: 24px;
`,
              ]}
            >
              <ChatMessage
                index={index() + 1}
                message={message}
                onDelete={(msg) =>
                  deleteRow(
                    msg,
                    false,
                    graph,
                    setGraph,
                    formStoreVertex()!.P.txnId!,
                  )
                }
              />
              <ChatResponse message={message} />
            </As>
          )}
        </For>

        <Show when={error()}>
          <As
            as="div"
            css={[
              css`
  padding: 16px;
  margin-bottom: 16px;
  color: rgb(239,68,68);
  background: rgb(254,242,242);
  border-radius: 6px;
`,
            ]}
          >
            An error occurred. {error()?.message}
            <As
              as="button"
              css={css`
  padding: 8px 16px;
  margin-top: 8px;
  color: rgb(59,130,246);
  border: 1px solid #3b82f6;
  border-radius: 6px;
  &:hover {
    background: rgb(239,246,255);
  }
`}
              onClick={() => reload()}
              type="button"
            >
              Retry
            </As>
          </As>
        </Show>

        <Show when={isLoading()}>
          <As
            as="div"
            css={[
              css`
  padding: 16px;
  color: rgb(107,114,128);
  display: flex;
  gap: 8px;
  align-items: center;
`,
            ]}
          >
            <As
              as="div"
              css={[
                css`
  display: flex;
  align-items: center;
  gap: 8px;
`,
              ]}
            >
              <As
                as="div"
                css={[
                  css`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #3b82f6;
  border-top-color: transparent;
  animation: spin 1s infinite linear;
`,
                ]}
              />
              <As as="span">AI is thinking...</As>
            </As>
            <As
              as="button"
              css={css`
  padding: 8px 16px;
  color: rgb(59,130,246);
  border: 1px solid #3b82f6;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background: rgb(239,246,255);
  }
`}
              onClick={() => stop()}
              type="button"
            >
              Stop
            </As>
          </As>
        </Show>
      </As>

      <ChatInput
        chatMessages={chatMessages()}
        examples={EXAMPLE_PROMPTS}
        examplesButtonRef={examplesButtonRef}
        fileInputRef={fileInputRef}
        files={files}
        input={input}
        isLoading={isLoading}
        onClearMessages={() => setMessages([])}
        onExampleClick={handleExampleClick}
        onExamplesToggle={setShowExamples}
        onFilesChange={(files) => setFiles(files)}
        onInputChange={handleInputChange}
        onSubmit={handleChatSubmit}
        showExamples={showExamples}
      />
    </As>
  );
}
