import { Icon } from "@iconify-icon/solid";

import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import { headerIconButtonClass } from "~/pages/admin_layout/constant";

import type { DBMessage } from "./types";

interface ChatMessageProps {
  index: number;
  message: Vertex<DBMessage>;
  onDelete: (message: Vertex) => void;
}

export function ChatMessage(props: ChatMessageProps) {
  return (
    <div class="padding:12px background:rgb(243,244,246) border-radius:6px margin-bottom:8px">
      <MessageHeader
        index={props.index}
        message={props.message}
        onDelete={props.onDelete}
      />
      <div>{props.message.P?.prompt}</div>
      {/* Commenting out file attachments for now
      // The file handling functionality can be revisited later when we have a proper solution for file storage.
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
      */}
    </div>
  );
}

function MessageHeader(props: {
  index: number;
  message: Vertex<DBMessage>;
  onDelete: (message: Vertex) => void;
}) {
  return (
    <div class="display:flex justify-content:space-between align-items:center font-weight:500 margin-bottom:4px">
      <div class="display:flex gap:8px align-items:center">
        <span>Prompt #{props.index}</span>
        {props.message.P?.timestamp && (
          <span class="font-size:12px color:rgb(107,114,128)">
            {new Date(props.message.P.timestamp).toLocaleTimeString()}
          </span>
        )}
        <span class="font-size:12px color:rgb(107,114,128)">
          Model: {props.message.P?.model}
        </span>
        {props.message.P?.hasFile && (
          <Icon
            class="font-size:12px color:rgb(107,114,128)"
            icon="ph:paperclip"
          />
        )}
      </div>
      <IconButton
        class={`${headerIconButtonClass} color:rgb(239,68,68)`}
        icon="ph:trash"
        onClick={() => props.onDelete(props.message)}
        title="Delete"
      />
    </div>
  );
}
