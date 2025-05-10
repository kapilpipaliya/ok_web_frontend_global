import { For } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { isObject } from "~/lib/data_structure/object/isObject";

import type { DBMessage } from "./types";

import { Preview } from "./Preview";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

interface ChatResponseProps {
  message: Vertex<DBMessage>;
}

export function ChatResponse(props: ChatResponseProps) {
  return (
    <As
      as="div"
      css={[
        css`
  padding: 16px;
  border: 1px solid \${args.theme.var.color.base_10};
  border-radius: 10px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  margin-top: 8px;
  transition: all 0.2s ease;
  width: 100%;
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
  }
`,
      ]}
    >
      <ResponseContent response={props.message.P.response} />
      <ResponsePreview message={props.message} />
    </As>
  );
}

function ResponseContent(props: { response: string }) {
  return (
    <>
      <As
        as="div"
        css={[
          css`
  font-weight: 600;
  margin-bottom: 8px;
  color: \${args.theme.var.color.base_60};
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  width: 100%;
`,
        ]}
      >
        <As
          as="span"
          css={css`
            background: linear-gradient(45deg, #4f94fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 18px;
          `}
        >
          🤖
        </As>
        AI Response
      </As>
      <As
        as="div"
        css={css`
  white-space: pre-wrap;
  line-height: 1.6;
  color: \${args.theme.var.color.base_70};
  font-size: 14px;
  padding: 16px;
  background: \${args.theme.var.color.base_2};
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  width: 100%;
  border: 1px solid \${args.theme.var.color.base_5};
`}
      >
        {props.response}
      </As>
    </>
  );
}

function ResponsePreview(props: { message: Vertex<DBMessage> }) {
  return (
    <As
      as="div"
      css={[
        css`
  margin-top: 20px;
  border-top: 1px solid \${args.theme.var.color.base_10};
  padding-top: 16px;
  width: 100%;
`,
      ]}
    >
      <As
        as="div"
        css={[
          css`
  font-weight: 600;
  margin-bottom: 12px;
  color: \${args.theme.var.color.base_60};
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  width: 100%;
`,
        ]}
      >
        <As
          as="span"
          css={css`
            font-size: 16px;
          `}
        >
          👁️
        </As>
        Preview
      </As>
      <As
        as="div"
        css={[
          css`
  border: 1px solid \${args.theme.var.color.base_10};
  padding: 16px;
  border-radius: 8px;
  min-height: 120px;
  background: \${args.theme.var.color.base_2};
  transition: border-color 0.2s;
  width: 100%;
  
  &:hover {
    border-color: #3b82f6;
  }
`,
        ]}
      >
        <For
          each={(() => {
            const parsed = JSON.parse(props.message.P.data || "[]");
            return Array.isArray(parsed)
              ? parsed
              : isObject(parsed)
                ? [parsed]
                : [];
          })()}
        >
          {(dataObj) => <Preview message={props.message} object={dataObj} />}
        </For>
      </As>
    </As>
  );
}
