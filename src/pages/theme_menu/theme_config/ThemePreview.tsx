import { createMemo, For } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { themeConfig } from "~/lib/graph/get/sync/theme/themeConfig";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

export function ThemePreview(props: { item: Vertex }) {
  const themeData = createMemo(() => {
    return themeConfig(props.item);
  });

  const getColorClass = (color?: string | { "@light": string }) => {
    return typeof color === "string"
      ? `background-color:${color};`
      : color
        ? `background-color:${color["@light"] || ""};`
        : "";
  };

  const colorVariables = ["primary", "secondary", "accent", "neutral"];

  return (
    <As
      as="div"
      css={css`
  display: flex;
  gap: 0.25rem;
`}
    >
      <For each={colorVariables}>
        {(variable) => (
          <As
            as="div"
            css={css`
  ${getColorClass(themeData()?.variables?.[variable])}
  height: 20px;
  width: 0.5rem;
`}
          />
        )}
      </For>
    </As>
  );
}
