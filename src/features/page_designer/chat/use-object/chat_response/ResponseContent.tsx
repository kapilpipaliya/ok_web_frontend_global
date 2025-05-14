import { As } from "~/components/As";
import { css } from "~/lib/styles";

export function ResponseContent(props: { response: string }) {
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
