import { Icon } from "@iconify-icon/solid";

import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/styled/IconButton";
import { headerIconButtonCss } from "~/pages/settings/constants";

import type { DBMessage } from "./types";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

interface ChatMessageProps {
  index: number;
  message: Vertex<DBMessage>;
  onDelete: (message: Vertex) => void;
}

export function ChatMessage(props: ChatMessageProps) {
  return (
    <As as="div" css={[css`
  padding: 12px;
  background: rgb(243,244,246);
  border-radius: 6px;
  margin-bottom: 8px;
`]}>
      <MessageHeader
        index={props.index}
        message={props.message}
        onDelete={props.onDelete}
      />
      <div>{props.message.P?.prompt}</div>
      {props.message.P?.timestamp && (
        <As as="div" css={css`
  font-size: 10px;
  color: rgb(107,114,128);
`}>
          {new Date(props.message.P.timestamp).toLocaleTimeString()}
        </As>
      )}
      <As as="div" css={css`
  font-size: 10px;
  color: rgb(107,114,128);
`}>
        Model: {props.message.P?.model}
      </As>
      {/* Commenting out file attachments for now
      // The file handling functionality can be revisited later when we have a proper solution for file storage.
      <Show when={props.message.P?.attachments?.length}>
        <As as="div" css={css`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`}>
          <For each={props.message.P?.attachments}>
            {file => (
              <Show when={file.type.startsWith('image/')}>
                <As as="img"
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  css={css`
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 4px;
`}
                />
              </Show>
            )}
          </For>
        </As>
      </Show>
      */}
    </As>
  );
}

function MessageHeader(props: {
  index: number;
  message: Vertex<DBMessage>;
  onDelete: (message: Vertex) => void;
}) {
  return (
    <>
      <As as="div" css={[css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  margin-bottom: 4px;
`]}>
        <As as="div" css={css`
  display: flex;
  gap: 8px;
  align-items: center;
`}>
          <As as="span">Prompt #{props.index}</As>
          {props.message.P?.hasFile && (
            <Icon
              css={css`
  font-size: 12px;
  color: rgb(107,114,128);
`}
              icon="ph:paperclip"
            />
          )}
        </As>
        <IconButton
          css={[headerIconButtonCss, css`
  color: rgb(239,68,68);
  background-color: transparent;
  border: none;
`]}
          icon="ph:trash"
          onClick={() => props.onDelete(props.message)}
          title="Delete"
        />
      </As>
    </>
  );
}
