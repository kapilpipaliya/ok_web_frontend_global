import { experimental_useObject as useObject } from '@ai-sdk/solid';
import { graphInterfaceSchema } from '../../../../routes/api/use-object/schema';
import { createMemo, createSignal, For, Show } from 'solid-js';
import { getGlobalStore } from '~/lib/graph/get/sync/getGlobalStore';
import { GraphInterface, Id, useGraph, Vertex } from '~/lib/graph/graph';
import { createStore, SetStoreFunction, Store } from 'solid-js/store';
import { object } from 'zod';
import { v7 as uuidv7 } from 'uuid';
import PageView from '~/components/page_attr_render/PageView';
import { DesignerFormIdContext, PageLayoutObject, useDesignerLayoutStore } from '../../context/LayoutContext';
import { IconButton } from '~/components/styled/IconButton';
import { headerIconButtonClass } from '~/pages/admin_layout/constant';
import { handleDropAtPosition } from '../../functions/handleDropAtPosition';
import { FormStoreObject } from '~/components/form/context/FormContext';
import { Preview } from './Preview';
import { DropdownMenu } from '~/components/styled/DropdownMenu';
import { addNewVertex, newVertex } from "~/lib/graph/mutate/vertex";
import { generateNewVertexId } from "~/lib/graph/transaction/generateNewVertexId";
import { generateNewTxnId } from "~/lib/graph/transaction/generateNewTxnId";
import { FormMetaData } from "~/lib/meta/formMetaData";
import { insertNewRow } from '~/components/fields/table_field/insertNewRow';
import { deleteRow } from '~/lib/graph/mutate/deleteRow';
import { evalExpression } from '~/lib/expression_eval';

interface Message {
  prompt: string;
  response: string;
  timestamp?: number;
}

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
    
    const chatHistory = evalExpression("->ChatHistory", { graph, setGraph, vertexes: [formDataVertex] }) as Vertex[] || []

    return chatHistory.sort((a, b) => ((a.P?.timestamp || 0) - (b.P?.timestamp || 0))) as Vertex<Message>[];
  });

  const [insertMode, setInsertMode] = createSignal<'before' | 'after' | 'center'>('after');
  const [showExamples, setShowExamples] = createSignal(false);
  const [input, setInput] = createSignal('');

  let chatHistoryRef: HTMLDivElement | undefined;
  let examplesButtonRef: HTMLButtonElement | undefined;

  const examples = [
    "Generate a responsive navigation bar with logo and menu items",
    "Create a hero section with image, heading and call-to-action button",
    "Design a contact form with name, email and message fields"
  ];

  const { submit, isLoading, object, stop, error } = useObject({
    api: '/api/use-object',
    schema: graphInterfaceSchema,
    onFinish(event) {
      // console.log('FinishReason', event.error);
      if (event.object && formStoreVertex()) {
        const message = { 
          prompt: input(), 
          response: JSON.stringify(object()), 
          timestamp: Date.now()
        } as Message;
        
        insertNewRow(
          newTxnId, // formStoreVertex()!.P.txnId,
          {P: {type: "ChatHistory"}} as unknown as Vertex,
          graph.vertexes[formStoreVertex()!.P.formDataId!],
          false,
          graph,
          setGraph,
          message
        );

        // setInput('');
        // Scroll to bottom after adding new message
        setTimeout(() => {
          if (chatHistoryRef) {
            chatHistoryRef.scrollTop = chatHistoryRef.scrollHeight;
          }
        }, 0);
      }
    },
  });

  const handleSubmit = (e: SubmitEvent | KeyboardEvent) => {
    e.preventDefault();
    if (!input().trim() || isLoading()) return;
    submit({ prompt: input() });
    // Scroll to bottom after submitting input
    setTimeout(() => {
      if (chatHistoryRef) {
        chatHistoryRef.scrollTop = chatHistoryRef.scrollHeight;
      }
    }, 0);
  };

  const handleInsert = (message: Vertex) => {
    const formVertex = graph.vertexes[layoutStoreId];
    const fromStoreVertex = graph.vertexes[`${message.id}FormStore`];
    if (!fromStoreVertex) {
      return;
    }
    if (layoutStoreVertex()?.P.formId === `${message.id}FormStore`) {
      return;
    }
    if (!layoutStoreVertex()?.P.formId) {
      return;
    }
    const toStoreVertex = graph.vertexes[layoutStoreVertex().P.formId!] as Vertex<FormStoreObject>;
    if (!toStoreVertex) {
      return;
    }
    if (!graph.vertexes[toStoreVertex.P.selectedId!]) {
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
    setInput(example);
    setShowExamples(false);
  };
  return (
    <div class={`display:flex flex-direction:column height:calc(100vh-${getGlobalStore(graph).P.navBarHeight + 12}px) width:100% max-width:md margin:0|auto`}>
      <div class="flex:1 overflow:auto padding:16px chat-history" ref={chatHistoryRef!}>
        <For each={messages()}>
          {(message) => (
            <div class="margin-bottom:24px">
              <div class="padding:12px background:rgb(243,244,246) border-radius:6px margin-bottom:8px">
                <div class="display:flex justify-content:space-between align-items:center font-weight:500 margin-bottom:4px">
                  <div class="display:flex gap:8px align-items:center">
                    <span>Prompt</span>
                    {message.P?.timestamp && (
                      <span class="font-size:12px color:rgb(107,114,128)">
                        {new Date(message.P.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <IconButton
                      icon="ph:trash"
                      class={`${headerIconButtonClass} color:rgb(239,68,68)`}
                      onClick={() => handleDelete(message)}
                      title="Delete"
                    />
                </div>
                <div>{message.P?.prompt}</div>
              </div>
              <div class="padding:12px background:white border:1px|solid|rgb(229,231,235) border-radius:6px">
                <div class="font-weight:500 margin-bottom:4px">Response:</div>
                <div class="white-space:pre-wrap">{JSON.stringify(JSON.parse(message.P.response), null, 2)}</div>

                <div class="margin-top:16px border-top:1px|solid|rgb(229,231,235) padding-top:16px">
                  <div class="font-weight:500 margin-bottom:8px">Preview:</div>
                  <div class="border:1px|dashed|rgb(209,213,219) padding:16px border-radius:6px min-height:100px">
                    <Preview object={JSON.parse(message.P.response)} formId={`${message.id}FormStore`} />
                  </div>

                  <div class="display:flex gap:8px margin-top:12px justify-content:space-between">
                    <div class="display:flex gap:8px">
                      <select
                        class="padding:8px border:1px|solid|rgb(209,213,219) border-radius:6px"
                        value={insertMode()}
                        onChange={(e) => setInsertMode(e.currentTarget.value as any)}
                      >
                        <option value="before">Insert Before</option>
                        <option value="after">Insert After</option>
                        <option value="center">Insert Into</option>
                      </select>

                      <IconButton
                        icon="ph:plus-circle"
                        class={`${headerIconButtonClass}`}
                        onClick={() => handleInsert(message)}
                        title="Insert"
                        disabled={layoutStoreVertex()?.P.formId === `${message.id}FormStore`}
                      />
                    </div>

                    <IconButton
                      icon="ph:trash"
                      class={`${headerIconButtonClass} color:rgb(239,68,68)`}
                      onClick={() => handleDelete(message)}
                      title="Delete"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </For>

        <Show when={error()}>
          {error => (
            <div class="padding:16px margin-bottom:16px color:rgb(239,68,68) background:rgb(254,242,242) border-radius:6px">
              An error occurred. {error()?.message}
            </div>
          )}
        </Show>

        <Show when={isLoading()}>
          <div class="padding:16px color:rgb(107,114,128)">
            <div>Loading...</div>
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

      <form
        onSubmit={handleSubmit}
        class="padding:16px background:white border-top:1px|solid|rgb(229,231,235)"
      >
        <div class="display:flex flex-direction:column gap:8px">
          <div class="display:flex gap:8px">
            <input
              class="flex:1 padding:8px border:1px|solid|rgb(209,213,219) border-radius:6px disabled:opacity:50 disabled:cursor:not-allowed"
              value={input()}
              disabled={isLoading()}
              placeholder="Generate a page... (Press Cmd+Enter to submit)"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isLoading()) {
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="button"
              class="padding:8px|16px color:rgb(59,130,246) border:1px|solid|rgb(59,130,246) border-radius:6px hover:background:rgb(239,246,255)"
              onClick={() => setShowExamples(!showExamples())}
              disabled={isLoading()}
              ref={examplesButtonRef}
            >
              Examples
            </button>
          </div>
          <Show when={showExamples()}>
            <DropdownMenu
              parentRef={examplesButtonRef!}
              onClickOutside={() => setShowExamples(false)}
              onMouseLeave={() => setShowExamples(false)}
            >
              <div class="display:flex flex-direction:column gap:4px padding:8px">
                <For each={examples}>
                  {example => (
                    <button
                      type="button"
                      class="text-align:left padding:8px background:rgb(243,244,246) border-radius:6px hover:background:rgb(229,231,235)"
                      onClick={() => handleExampleClick(example)}
                    >
                      {example}
                    </button>
                  )}
                </For>
              </div>
            </DropdownMenu>
          </Show>
        </div>
      </form>
    </div>
  );
}
