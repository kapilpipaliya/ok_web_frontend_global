import { experimental_useObject as useObject } from '@ai-sdk/solid';
import { graphInterfaceSchema } from '../../../../routes/api/use-object/schema';
import { createSignal, For, Show } from 'solid-js';
import { getGlobalStore } from '~/lib/graph/get/sync/getGlobalStore';
import { useGraph } from '~/lib/graph/graph';
import { createStore } from 'solid-js/store';

export function UseObject() {
  const [graph, setGraph] = useGraph();
  const [messages, setMessages] = createStore<Array<{prompt: string, response: any}>>([]);
  const [insertMode, setInsertMode] = createSignal<'before' | 'after' | 'center'>('after');
  
  const { submit, isLoading, object, stop, error } = useObject({
    api: '/api/use-object',
    schema: graphInterfaceSchema,
    onFinish(event) {
      console.log('FinishReason', event.error);
      if (event.object) {
        setMessages([...messages, {prompt: input(), response: object()}]);
      }
    },
  });

  const [input, setInput] = createSignal('');

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    submit({prompt: input()});
  };

  const handleInsert = (response: any) => {
    // TODO: Implement graph insertion logic based on insertMode()
    console.log('Inserting with mode:', insertMode(), response);
  };

  return (
    <div class={`display:flex flex-direction:column height:calc(100vh-${getGlobalStore(graph).P.navBarHeight + 12}px) width:100% max-width:md margin:0|auto`}>
      <div class="flex:1 overflow:auto padding:16px">
        <For each={messages}>
          {(message, index) => (
            <div class="margin-bottom:24px">
              <div class="padding:12px background:rgb(243,244,246) border-radius:6px margin-bottom:8px">
                <div class="font-weight:500 margin-bottom:4px">Prompt:</div>
                <div>{message.prompt}</div>
              </div>
              <div class="padding:12px background:white border:1px|solid|rgb(229,231,235) border-radius:6px">
                <div class="font-weight:500 margin-bottom:4px">Response:</div>
                <div class="white-space:pre-wrap">{JSON.stringify(message.response, null, 2)}</div>
                
                <div class="margin-top:16px border-top:1px|solid|rgb(229,231,235) padding-top:16px">
                  <div class="font-weight:500 margin-bottom:8px">Preview:</div>
                  <div class="border:1px|dashed|rgb(209,213,219) padding:16px border-radius:6px min-height:100px">
                    {/* TODO: Implement preview rendering based on the graph structure */}
                    Preview placeholder
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
                    
                    <button
                      type="button"
                      class="padding:8px|16px color:white background:rgb(59,130,246) border-radius:6px hover:background:rgb(37,99,235)"
                      onClick={() => handleInsert(message.response)}
                    >
                      Insert Component
                    </button>
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
            placeholder="Generate a page..."
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            class="padding:8px|16px color:white background:rgb(59,130,246) border-radius:6px hover:background:rgb(37,99,235) disabled:background:rgb(191,219,254)"
            disabled={isLoading()}
          >
            Generate
          </button>
        </div>
      </form>
    </div>
  );
}
