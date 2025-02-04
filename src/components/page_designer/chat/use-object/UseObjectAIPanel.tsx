import { createMemo, createSignal, For, Show } from 'solid-js';
import { getGlobalStore } from '~/lib/graph/get/sync/getGlobalStore';
import { Id, useGraph, Vertex } from '~/lib/graph/graph';
import { PageLayoutObject, useDesignerLayoutStore } from '../../context/LayoutContext';
import { IconButton } from '~/components/styled/IconButton';
import { headerIconButtonClass } from '~/pages/admin_layout/constant';
import { handleDropAtPosition } from '../../functions/handleDropAtPosition';
import { FormStoreObject } from '~/components/form/context/FormContext';
import { Preview } from './Preview';
import { DropdownMenu } from '~/components/styled/DropdownMenu';
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { insertNewRow } from '~/components/fields/table_field/insertNewRow';
import { deleteRow } from '~/lib/graph/mutate/deleteRow';
import { evalExpression } from '~/lib/expression_eval';
import { useChat } from '@ai-sdk/solid';
import { ChatMessage } from './ChatMessage';
import { ChatResponse } from './ChatResponse';
import { ChatInput } from './ChatInput';
import { Message } from './types';

export function UseObjectAIPanel() {
  const [graph, setGraph] = useGraph();
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () => graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  const newTxnId = generateNewTxnId(graph, setGraph);
  
  // Get the first mainPanel's formId and formStore
  const formStoreId = () => {
    const mainPanelId = layoutStoreVertex().P.mainPanel[0];
    return layoutStoreVertex().P[`mainPanel${mainPanelId}Tab`] as Id | null;
  };

  const formStoreVertex = () => formStoreId() ? graph.vertexes[formStoreId()!] as Vertex<FormStoreObject> : undefined;

  const messages = createMemo(() => {
    const formDataVertex = formStoreVertex()?.P.formDataId ? graph.vertexes[formStoreVertex()!.P.formDataId!] : undefined;
    if (!formDataVertex) return [];
    
    const chatHistory = evalExpression("->ChatHistory", { graph, setGraph, vertexes: [formDataVertex] }) as Vertex[] || [];
    return chatHistory.sort((a, b) => ((a.P?.timestamp || 0) - (b.P?.timestamp || 0))) as Vertex<Message>[];
  });

  const [insertMode, setInsertMode] = createSignal<'before' | 'after' | 'center'>('after');
  const [showExamples, setShowExamples] = createSignal(false);
  const [files, setFiles] = createSignal<FileList | undefined>(undefined);
  const [frameCount, setFrameCount] = createSignal(0);

  let chatHistoryRef: HTMLDivElement | undefined;
  let examplesButtonRef: HTMLButtonElement | undefined;
  let fileInputRef: HTMLInputElement | undefined;

  const examples = [
    "Generate a responsive navigation bar with logo and menu items",
    "Create a hero section with image, heading and call-to-action button",
    "Design a contact form with name, email and message fields",
    "Create a pricing table with multiple tiers",
    "Generate a footer with social media links and company info",
    "Create a testimonials section with customer reviews",
    "Design a product gallery with grid layout",
    "Generate a FAQ accordion section",
    "Create a blog post layout with featured image",
    "Design a team members showcase section",
    "Generate a services showcase with icons",
    "Create a portfolio grid with filtering options"
  ];

  const handleMessageSave = (messageData: Message) => {
    if (!formStoreVertex()) return;

    insertNewRow(
      newTxnId, // formStoreVertex()!.P.txnId,
      {P: {type: "ChatHistory"}} as unknown as Vertex,
      graph.vertexes[formStoreVertex()!.P.formDataId!],
      false,
      graph,
      setGraph,
      messageData
    );

    setFiles(undefined);
    if (fileInputRef) {
      fileInputRef.value = '';
    }
    setFrameCount(0);

    setTimeout(() => {
      if (chatHistoryRef) {
        chatHistoryRef.scrollTop = chatHistoryRef.scrollHeight;
      }
    }, 0);
  };

  const { handleSubmit, isLoading, input, handleInputChange, messages: chatMessages, stop, error, reload } = useChat({
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
        prompt: input(),
        response: content,
        data: data,
        timestamp: Date.now(),
        attachments: files() ? Array.from(files()!) : undefined
      } as Message;
      
      handleMessageSave(messageData);
      setFrameCount(0);
      
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
    
    handleSubmit(e, {
      experimental_attachments: files(),
      body: {
        model: model
      }
    });
    
    setTimeout(() => {
      if (chatHistoryRef) {
        chatHistoryRef.scrollTop = chatHistoryRef.scrollHeight;
      }
    }, 0);
  };

  const handleInsert = (message: Vertex) => {
    const fromStoreVertex = graph.vertexes[`${message.id}FormStore`];
    if (!fromStoreVertex || layoutStoreVertex()?.P.formId === `${message.id}FormStore` || !layoutStoreVertex()?.P.formId) {
      return;
    }

    const toStoreVertex = graph.vertexes[layoutStoreVertex().P.formId!] as Vertex<FormStoreObject>;
    if (!toStoreVertex || !graph.vertexes[toStoreVertex.P.selectedId!]) {
      return;
    }

    handleDropAtPosition(
      graph,
      setGraph,
      toStoreVertex.P.txnId,
      graph.vertexes[toStoreVertex.P.formDataId!],
      graph.vertexes[fromStoreVertex.P.formDataId!],
      graph.vertexes[toStoreVertex.P.selectedId!],
      insertMode()
    );
  };

  const handleDelete = (message: Vertex) => {
    deleteRow(
      message,
      false,
      graph,
      setGraph,
      newTxnId, // formStoreVertex()!.P.txnId
    );
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
              <ChatMessage message={message} onDelete={handleDelete} />
              <ChatResponse
                message={message}
                insertMode={insertMode}
                setInsertMode={setInsertMode}
                onInsert={handleInsert}
                onDelete={handleDelete}
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
          <div class="padding:16px color:rgb(107,114,128)">
            <div>Loading... (Frames received: {frameCount()})</div>
            <button
              type="button"
              class="padding:8px|16px margin-top:8px color:rgb(59,130,246) border:1px|solid|rgb(59,130,246) border-radius:6px hover:background:rgb(239,246,255)"
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
        examples={examples}
        onSubmit={handleSubmit2}
        onInputChange={handleInputChange}
        onFilesChange={(files) => setFiles(files)}
        onExamplesToggle={setShowExamples}
        onExampleClick={handleExampleClick}
        fileInputRef={fileInputRef}
        examplesButtonRef={examplesButtonRef}
      />
    </div>
  );
}
