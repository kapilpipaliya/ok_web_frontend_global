import type { DBMessage } from "../types";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { ResponseContent } from "~/features/page_designer/chat/use-object/chat_response/ResponseContent";
import { ResponsePreview } from "~/features/page_designer/chat/use-object/chat_response/ResponsePreview";

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
