import { For } from "solid-js";

import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { IdAttr } from "~/lib/graph/type/idAttr";

import { Label } from "./Label";

const OPTIONS = [
  { value: "", label: "Plain Text" },
  { value: "markdown", label: "Markdown" },
] as const;

export function TextTypeButtonGroup(props: {
  meta: Vertex;
  onChange: (meta: Vertex, data: unknown) => void;
  selectedLayout: Vertex;
}) {
  const currentValue = () =>
    String(props.selectedLayout?.P[props.meta.P[IdAttr]] ?? "");

  const buttonCss = (option: (typeof OPTIONS)[number], index: number) => {
    const isFirst = index === 0;
    const isLast = index === OPTIONS.length - 1;
    return `return \`._id {
      flex: 1;
      padding: 4px 8px;
      font-size: 0.8125rem;
      border: 1px solid \${t.var.color.border};
      cursor: pointer;
      background: ${
        currentValue() === option.value
          ? "${t.var.color.primary}"
          : "${t.var.color.background_light_200}"
      };
      color: ${
        currentValue() === option.value
          ? "${t.var.color.primary_text}"
          : "${t.var.color.text}"
      };
      border-radius: ${isFirst ? "4px 0 0 4px" : isLast ? "0 4px 4px 0" : "0"};
      margin-left: ${isFirst ? "0" : "-1px"};
    }\`;`;
  };

  return (
    <As
      as="div"
      css={`return \`._id {
        display: flex;
        align-items: center;
        gap: 2px;
        justify-content: space-between;
        margin-top: 6px;
      }\`;`}
    >
      <As
        as="span"
        css={`return \`._id {
          font-size: 15px;
          flex: 0.5;
        }\`;`}
      >
        <Label meta={props.meta} />
      </As>
      <As
        as="div"
        css={`return \`._id {
          display: flex;
          flex: 1;
          gap: 0;
        }\`;`}
      >
        <For each={OPTIONS}>
          {(option, index) => (
            <As
              as="button"
              css={buttonCss(option, index())}
              onClick={() => props.onChange(props.meta, option.value)}
              type="button"
            >
              {option.label}
            </As>
          )}
        </For>
      </As>
    </As>
  );
}
