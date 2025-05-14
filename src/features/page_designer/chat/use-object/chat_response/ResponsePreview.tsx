import type { Vertex } from "~/lib/graph/type/vertex";
import type { DBMessage } from "~/features/page_designer/chat/use-object/types";
import { As } from "~/components/As";
import { css } from "~/lib/styles";
import { For, Suspense } from "solid-js";
import { isObject } from "~/lib/data_structure/object/isObject";
import { Preview } from "~/features/page_designer/chat/use-object/chat_response/Preview";

export function ResponsePreview(props: { message: Vertex<DBMessage> }) {
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
          {(dataObj) => (
            <Suspense>
              <Preview message={props.message} object={dataObj} />
            </Suspense>
          )}
        </For>
      </As>
    </As>
  );
}
