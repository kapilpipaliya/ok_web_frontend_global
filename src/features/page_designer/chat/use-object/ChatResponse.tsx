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
    <As as="div" css={[css`
  padding: 12px;
  border: 1px solid #3b82f6;
  border-radius: 6px;
`]}>
      <ResponseContent response={props.message.P.response} />
      <ResponsePreview message={props.message} />
    </As>
  );
}

function ResponseContent(props: { response: string }) {
  return (
    <>
      <As as="div" css={[css`
  font-weight: 500;
  margin-bottom: 4px;
`]}>Response:</As>
      <As as="div" css={css`
  white-space: pre-wrap;
`}>{props.response}</As>
    </>
  );
}

function ResponsePreview(props: { message: Vertex<DBMessage> }) {
  return (
    <As as="div" css={[css`
  margin-top: 16px;
  border-top: 1px solid #3b82f6;
  padding-top: 16px;
`]}>
      <As as="div" css={[css`
  font-weight: 500;
  margin-bottom: 8px;
`]}>Preview:</As>
        <As as="div" css={[css`
  border: 1px dashed #3b82f6;
  padding: 16px;
  border-radius: 6px;
  min-height: 100px;
`]}>
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
