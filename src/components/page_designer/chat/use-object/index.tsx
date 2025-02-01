import { experimental_useObject as useObject } from '@ai-sdk/solid';
import { graphInterfaceSchema } from '../../../../routes/api/use-object/schema';
import { createSignal, For, Show } from 'solid-js';
import { getGlobalStore } from '~/lib/graph/get/sync/getGlobalStore';
import { useGraph, Vertex } from '~/lib/graph/graph';
import { createStore } from 'solid-js/store';
import { object } from 'zod';
import { v7 as uuidv7 } from 'uuid';
import PageView from '~/components/page_attr_render/PageView';
import { DesignerFormIdContext, PageLayoutObject, useDesignerLayoutStore } from '../../context/LayoutContext';
import { IconButton } from '~/components/styled/IconButton';
import { headerIconButtonClass } from '~/pages/admin_layout/constant';
import { handleDropAtPosition } from '../../functions/handleDropAtPosition';
import { FormStoreObject } from '~/components/form/context/FormContext';
import { Preview } from './Preview';

interface Message {
  prompt: string;
  response: any;
  formId: string;
}

export function UseObject() {
  const [graph, setGraph] = useGraph();
  const [messages, setMessages] = createStore<Array<Message>>([]);
  const [insertMode, setInsertMode] = createSignal<'before' | 'after' | 'center'>('after');
  const layoutStoreId = useDesignerLayoutStore();
  const layoutStoreVertex = () => graph.vertexes[layoutStoreId] as Vertex<PageLayoutObject>;
  let chatHistoryRef: HTMLDivElement | undefined;

  const { submit, isLoading, object, stop, error } = useObject({
    api: '/api/use-object',
    schema: graphInterfaceSchema,
    onFinish(event) {
      console.log('FinishReason', event.error);
      if (event.object) {
        setMessages([...messages, { prompt: input(), response: object(), formId: uuidv7() }]);
        // Scroll to bottom after adding new message
        setTimeout(() => {
          if (chatHistoryRef) {
            chatHistoryRef.scrollTop = chatHistoryRef.scrollHeight;
          }
        }, 0);
      }
    },
  });

  const [input, setInput] = createSignal('');

  const handleSubmit = (e: SubmitEvent | KeyboardEvent) => {
    e.preventDefault();
    submit({ prompt: input() });
    // Scroll to bottom after submitting input
    setTimeout(() => {
      if (chatHistoryRef) {
        chatHistoryRef.scrollTop = chatHistoryRef.scrollHeight;
      }
    }, 0);
  };

  const handleInsert = (response: Message) => {
    const formVertex = graph.vertexes[layoutStoreId];
    const fromStoreVertex = graph.vertexes[response.formId];
    if (!fromStoreVertex) {
      return;
    }
    if (layoutStoreVertex()?.P.formId === response.formId) {
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

  const handleDelete = (formId: string) => {
    setMessages(messages.filter(message => message.formId !== formId));
  };

  return (
    <div class={`display:flex flex-direction:column height:calc(100vh-${getGlobalStore(graph).P.navBarHeight + 12}px) width:100% max-width:md margin:0|auto`}>
      <div class="flex:1 overflow:auto padding:16px chat-history" ref={chatHistoryRef!}>
        <For each={messages}>
          {(message, index) => (
            <div class="margin-bottom:24px">
              <div class="padding:12px background:rgb(243,244,246) border-radius:6px margin-bottom:8px">
                <div class="display:flex justify-content:space-between align-items:center font-weight:500 margin-bottom:4px">
                  <span>Prompt</span>
                  <IconButton
                      icon="ph:trash"
                      class={`${headerIconButtonClass} color:rgb(239,68,68)`}
                      onClick={() => handleDelete(message.formId)}
                      title="Delete"
                    />
                </div>
                <div>{message.prompt}</div>
              </div>
              <div class="padding:12px background:white border:1px|solid|rgb(229,231,235) border-radius:6px">
                <div class="font-weight:500 margin-bottom:4px">Response:</div>
                <div class="white-space:pre-wrap">{JSON.stringify(message.response, null, 2)}</div>

                <div class="margin-top:16px border-top:1px|solid|rgb(229,231,235) padding-top:16px">
                  <div class="font-weight:500 margin-bottom:8px">Preview:</div>
                  <div class="border:1px|dashed|rgb(209,213,219) padding:16px border-radius:6px min-height:100px">
                    <Preview object={message.response} formId={message.formId} />
                  </div>

                  <div class="display:flex gap:8px margin-top:12px">
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
                      disabled={layoutStoreVertex()?.P.formId === message.formId}
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
        <div class="display:flex gap:8px">
          <input
            class="flex:1 padding:8px border:1px|solid|rgb(209,213,219) border-radius:6px"
            value={input()}
            placeholder="Generate a page... (Press Cmd+Enter to submit)"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isLoading()) {
                handleSubmit(e);
              }
            }}
          />
        </div>
      </form>
    </div>
  );
}
