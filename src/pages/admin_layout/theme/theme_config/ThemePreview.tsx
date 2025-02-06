import { createMemo, For } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";
export function ThemePreview(props: { item: Vertex }) {
  const themeData = createMemo(() => {
    try {
      return JSON.parse(props.item.P.data);
    } catch (error) {
      console.error("Failed to parse theme data:", error);
      return { variables: {} };
    }
  });

  const getColorClass = (color?: string | { "@light": string }) => {
    return typeof color === "string"
      ? `bg:${color}`
      : color
        ? `bg:${color["@light"] || ""}`
        : "";
  };

  const colorVariables = ["primary", "secondary", "accent", "neutral"];

  return (
    <div class="flex gap:0.25rem">
      <For each={colorVariables}>
        {(variable) => (
          <div
            class={`${getColorClass(themeData().variables?.[variable])} h:20px w:0.5rem`}
          />
        )}
      </For>
    </div>
  );
}
