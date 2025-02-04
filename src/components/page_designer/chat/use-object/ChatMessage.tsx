import { Show } from 'solid-js';
import { IconButton } from '~/components/styled/IconButton';
import { headerIconButtonClass } from '~/pages/admin_layout/constant';
import { Vertex } from '~/lib/graph/graph';
import { Message } from './types';

interface ChatMessageProps {
  message: Vertex<Message>;
  onDelete: (message: Vertex) => void;
}

export function ChatMessage(props: ChatMessageProps) {
  return (
    <div class="padding:12px background:rgb(243,244,246) border-radius:6px margin-bottom:8px">
      <div class="display:flex justify-content:space-between align-items:center font-weight:500 margin-bottom:4px">
        <div class="display:flex gap:8px align-items:center">
          <span>Prompt</span>
          {props.message.P?.timestamp && (
            <span class="font-size:12px color:rgb(107,114,128)">
              {new Date(props.message.P.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
        <IconButton
          icon="ph:trash"
          class={`${headerIconButtonClass} color:rgb(239,68,68)`}
          onClick={() => props.onDelete(props.message)}
          title="Delete"
        />
      </div>
      <div>{props.message.P?.prompt}</div>
      <Show when={props.message.P?.attachments?.length}>
        <div class="display:flex gap:8px margin-top:8px">
          <For each={props.message.P?.attachments}>
            {file => (
              <Show when={file.type.startsWith('image/')}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  class="width:64px height:64px object-fit:cover border-radius:4px"
                />
              </Show>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
} 