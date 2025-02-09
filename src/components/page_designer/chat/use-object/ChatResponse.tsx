import { For } from 'solid-js';

import type { Vertex } from '~/lib/graph/graph';

import { isObject } from '~/lib/data_structure/object/isObject';

import type { DBMessage } from './types';

import { Preview } from './Preview';

interface ChatResponseProps {
  message: Vertex<DBMessage>;
}

export function ChatResponse(props: ChatResponseProps) {
  return (
    <div class="padding:12px background:white border:1px|solid|rgb(229,231,235) border-radius:6px">
      <ResponseContent response={props.message.P.response} />
      <ResponsePreview message={props.message} />
    </div>
  );
}

function ResponseContent(props: { response: string }) {
  return (
    <>
      <div class="font-weight:500 margin-bottom:4px">Response:</div>
      <div class="white-space:pre-wrap">{props.response}</div>
    </>
  );
}

function ResponsePreview(props: { message: Vertex<DBMessage> }) {
  return (
    <div class="margin-top:16px border-top:1px|solid|rgb(229,231,235) padding-top:16px">
      <div class="font-weight:500 margin-bottom:8px">Preview:</div>
      <div class="border:1px|dashed|rgb(209,213,219) padding:16px border-radius:6px min-height:100px">
        <For each={(() => {
          const parsed = JSON.parse(props.message.P.data || '[]');
          return Array.isArray(parsed) ? parsed : (isObject(parsed) ? [parsed] : []);
        })()}>
          {(dataObj) => (
            <Preview
              message={props.message}
              object={dataObj}
            />
          )}
        </For>
      </div>
    </div>
  );
} 