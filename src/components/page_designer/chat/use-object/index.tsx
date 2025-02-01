import { experimental_useObject as useObject } from '@ai-sdk/solid';
import { graphInterfaceSchema } from '../../../../routes/api/use-object/schema';
import { createSignal, For, Show } from 'solid-js';
import { getGlobalStore } from '~/lib/graph/get/sync/getGlobalStore';
import { useGraph } from '~/lib/graph/graph';

export function UseObject() {
  const [graph, setGraph] = useGraph();
  const { submit, isLoading, object, stop, error } = useObject({
    api: '/api/use-object',
    schema: graphInterfaceSchema,
    onFinish(event) {
      // console.log('Usage', event.object);
      console.log('FinishReason', event.error);
    },
  });

  const [input, setInput] = createSignal('');

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    submit({prompt: input()});
  };

  return (
    <div class={`display:flex flex-direction:column height:calc(100vh-${getGlobalStore(graph).P.navBarHeight + 12}px) width:100% max-width:md margin:0|auto`}>
      <div class="flex:1 overflow:auto padding:16px">
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

        <div class="padding:16px white-space:pre-wrap">
          {JSON.stringify(object())}
        </div>
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
