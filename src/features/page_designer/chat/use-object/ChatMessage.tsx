import { Icon } from "@iconify-icon/solid";

import { IconButton } from "~/components/styled/IconButton";
import { headerIconButtonCss } from "~/pages/settings/constants";

import type { DBMessage } from "./types";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";

interface ChatMessageProps {
  index: number;
  message: Vertex<DBMessage>;
  onDelete: (message: Vertex) => void;
}

export function ChatMessage(props: ChatMessageProps) {
  return (
    <As
      as="div"
      css={[
        css`
  padding: 16px;
  background: \${args.theme.var.color.base_2};
  border-radius: 10px;
  margin-bottom: 12px;
  border: 1px solid \${args.theme.var.color.base_10};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease;
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`,
      ]}
    >
      <MessageHeader
        index={props.index}
        message={props.message}
        onDelete={props.onDelete}
      />
      <As
        as="div"
        css={css`
          margin: 10px 0 14px;
          font-size: 15px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
          width: 100%;
        `}
      >
        {props.message.P?.prompt}
      </As>
      <As
        as="div"
        css={css`
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid \${args.theme.var.color.base_10};
          font-size: 11px;
          color: \${args.theme.var.color.base_40};
          width: 100%;
        `}
      >
        <As
          as="div"
          css={css`
            display: flex;
            gap: 12px;
            align-items: center;
          `}
        >
          {props.message.P?.timestamp && (
            <As
              as="div"
              css={css`
                display: flex;
                align-items: center;
                gap: 4px;
              `}
            >
              <As
                as="span"
                css={css`
                  display: flex;
                  align-items: center;
                `}
              >
                <Icon icon="ph:clock" />
              </As>
              {new Date(props.message.P.timestamp).toLocaleTimeString()}
            </As>
          )}
          <As
            as="div"
            css={css`
              display: flex;
              align-items: center;
              gap: 4px;
            `}
          >
            <As
              as="span"
              css={css`
                display: flex;
                align-items: center;
              `}
            >
              <Icon icon="ph:robot" />
            </As>
            {props.message.P?.model || "Unknown model"}
          </As>
        </As>
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
    <As
      as="div"
      css={[
        css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  margin-bottom: 10px;
  width: 100%;
`,
      ]}
    >
      <As
        as="div"
        css={css`
  display: flex;
  gap: 8px;
  align-items: center;
  background: \${args.theme.var.color.base_5};
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 13px;
`}
      >
        <As
          as="span"
          css={css`
            font-size: 16px;
            color: \${args.theme.var.color.base_50};
            display: flex;
            align-items: center;
          `}
        >
          <Icon icon="ph:chat-circle-text" />
        </As>
        <As as="span">Prompt #{props.index}</As>
        {props.message.P?.hasFile && (
          <As
            as="span"
            css={css`
              font-size: 14px;
              color: \${args.theme.var.color.base_50};
              display: flex;
              align-items: center;
            `}
          >
            <Icon icon="ph:paperclip" />
          </As>
        )}
      </As>
      <IconButton
        css={[
          headerIconButtonCss,
          css`
  color: \${args.theme.var.color.base_40};
  background-color: transparent;
  border: none;
  transition: color 0.2s;
  
  &:hover {
    color: rgb(239,68,68);
  }
`,
        ]}
        icon="ph:trash"
        onClick={() => props.onDelete(props.message)}
        title="Delete"
      />
    </As>
  );
}
