import { createMemo, createSignal, For, Show } from 'solid-js';
import { getGlobalStore } from '~/lib/graph/get/sync/getGlobalStore';
import { GraphInterface, Id, useGraph, Vertex } from '~/lib/graph/graph';
import { PageLayoutObject, useDesignerLayoutStore } from '../../context/LayoutContext';
import { FormStoreObject } from '~/components/form/context/FormContext';
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { insertNewRow } from '~/components/fields/table_field/insertNewRow';
import { deleteRow } from '~/lib/graph/mutate/deleteRow';
import { useChat } from '@ai-sdk/solid';
import { ChatMessage } from './ChatMessage';
import { ChatResponse } from './ChatResponse';
import { ChatInput } from './ChatInput';
import { DBMessage } from './types';
import { themeConfig } from '~/cypher/get/themeConfig';
import { SetStoreFunction } from 'solid-js/store';
import { EXAMPLE_PROMPTS } from './constants/EXAMPLE_PROMPTS';
import { getChatHistory } from './functions/getChatHistory';
import { insertAtPosition } from './functions/insertAtPosition';

// Get the first mainPanel's formId and formStore
export function UseObjectAIPanel() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () => graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const newTxnId = generateNewTxnId(graph, setGraph);

  const formStoreVertex = () => layoutStoreVertex().P.mainFormId ? graph.vertexes[layoutStoreVertex().P.mainFormId!] as Vertex<FormStoreObject> : undefined;
  const messages = createMemo(() => getChatHistory(graph, setGraph, formStoreVertex));

  const [insertMode, setInsertMode] = createSignal<'before' | 'after' | 'center'>('after');
  const [showExamples, setShowExamples] = createSignal(false);
  const [files, setFiles] = createSignal<FileList | undefined>(undefined);
  const [frameCount, setFrameCount] = createSignal(0);
  const [lastRequestPrompt, setLastRequestPrompt] = createSignal<string>('');

  let chatHistoryRef: HTMLDivElement | undefined;
  let examplesButtonRef: HTMLButtonElement | undefined;
  let fileInputRef: HTMLInputElement | undefined;

  const globalTheme = themeConfig(graph);

  const { handleSubmit, isLoading, input, handleInputChange, messages: chatMessages, stop, error, reload, setMessages } = useChat({
    onResponse(response) {
      setFrameCount(prev => prev + 1);
    },
    onFinish(message, { usage, finishReason }) {
      const content = message.content;
      let data: any = undefined;

      // Try to parse the entire content as JSON first
      try {
        data = JSON.stringify(JSON.parse(content));
      } catch {
        // If that fails, try to find JSON code block
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          try {
            data = JSON.stringify(JSON.parse(jsonMatch[1]));
          } catch {
            // If JSON parsing fails, leave data as undefined
          }
        }
      }

      const messageData = {
        prompt: lastRequestPrompt(),
        response: content,
        data: data,
        timestamp: Date.now(),
        attachments: files() ? Array.from(files()!) : undefined
      } as DBMessage;

      if (!formStoreVertex()) return;

      insertNewRow(
        newTxnId, // formStoreVertex()!.P.txnId,
        { P: { type: "ChatHistory" } } as unknown as Vertex,
        graph.vertexes[formStoreVertex()!.P.formDataId!],
        false,
        graph,
        setGraph,
        messageData
      );

      setFrameCount(0);

      setTimeout(() => {
        if (chatHistoryRef) {
          chatHistoryRef.scrollTop = chatHistoryRef.scrollHeight;
        }
      }, 0);

      if (!error()) {
        // clear input and files on successful completion
        // @ts-expect-error ignore error
        handleInputChange({ target: { value: '' } });
        setFiles(undefined);
        if (fileInputRef) {
          fileInputRef.value = '';
        }
      }
    },
  });

  const handleSubmit2 = (e: SubmitEvent, model: string) => {
    e.preventDefault();
    if (!input().trim() || isLoading()) return;

    setLastRequestPrompt(input());

    handleSubmit(e, {
      experimental_attachments: files(),
      body: {
        model: model,
        extraMessages: [
          {
            role: 'system',
            content: `
You are a designer.
You have access to the following theme color variables:
\`\`\`json
${JSON.stringify(globalTheme)}
\`\`\`
When specifying colors in css properties, you can use either:
1. Theme color variables from above (preferred for consistency)
2. Direct color values like hex codes, rgb(), etc when needed
3. CSS color keywords

Choose colors that work well for the context and maintain good contrast ratios.
`.trim()
          }
        ]
      }
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
    <div class={`display:flex flex-direction:column height:calc(100vh-${getGlobalStore(graph).P.navBarHeight + 12}px) width:100% max-width:md margin:0|auto`}>
      <div class="flex:1 overflow:auto padding:16px chat-history" ref={chatHistoryRef!}>
        <For each={messages()}>
          {(message) => (
            <div class="margin-bottom:24px">
              <ChatMessage message={message} onDelete={(msg) => deleteRow( msg, false,graph,setGraph,newTxnId)} />
              <ChatResponse
                message={message}
                insertMode={insertMode}
                setInsertMode={setInsertMode}
                onInsert={(msg) => insertAtPosition(msg, insertMode(), graph, setGraph, layoutStoreVertex)}
                onDelete={(msg) => deleteRow( msg, false,graph,setGraph,newTxnId)}
                disabled={layoutStoreVertex()?.P.formId === `${message.id}FormStore`}
              />
            </div>
          )}
        </For>

        <Show when={error()}>
          <div class="padding:16px margin-bottom:16px color:rgb(239,68,68) background:rgb(254,242,242) border-radius:6px">
            An error occurred. {error()?.message}
            <button
              type="button"
              class="padding:8px|16px margin-top:8px color:rgb(59,130,246) border:1px|solid|rgb(59,130,246) border-radius:6px hover:background:rgb(239,246,255)"
              onClick={() => reload()}
            >
              Retry
            </button>
          </div>
        </Show>

        <Show when={isLoading()}>
          <div class="padding:16px color:rgb(107,114,128) display:flex gap:8px align-items:center">
            <div class="display:flex align-items:center gap:8px">
              <div class="width:16px height:16px border-radius:50% border:2px|solid|rgb(59,130,246) border-top-color:transparent @rotate|1s|infinite|linear"></div>
              <span>AI is thinking...</span>
            </div>
            <button
              type="button"
              class="padding:8px|16px color:rgb(59,130,246) border:1px|solid|rgb(59,130,246) border-radius:6px hover:background:rgb(239,246,255) cursor:pointer"
              onClick={() => stop()}
            >
              Stop
            </button>
          </div>
        </Show>
      </div>

      <ChatInput
        input={input}
        isLoading={isLoading}
        files={files}
        showExamples={showExamples}
        examples={EXAMPLE_PROMPTS}
        onSubmit={handleSubmit2}
        onInputChange={handleInputChange}
        onFilesChange={(files) => setFiles(files)}
        onExamplesToggle={setShowExamples}
        onExampleClick={handleExampleClick}
        fileInputRef={fileInputRef}
        examplesButtonRef={examplesButtonRef}
        chatMessages={chatMessages()}
        onClearMessages={() => setMessages([])}
      />
    </div>
  );
}
