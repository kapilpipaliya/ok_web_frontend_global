import { type JSX, createMemo, splitProps } from "solid-js";

import "./message.css";

export type MessageProps = {
  inline?: boolean;
  type: "error" | "info" | "success" | "warning";
} & JSX.HTMLAttributes<HTMLDivElement>;

export function Message(props: MessageProps) {
  const [messageProps, divProps] = splitProps(props, [
    "type",
    "class",
    "inline",
  ]);
  const className = createMemo(() =>
    [
      ...new Set(
        [
          "sb-message",
          messageProps.type,
          messageProps.class,
          messageProps.inline && "inline",
        ].filter(Boolean),
      ),
    ].join(" "),
  );

  return (
    <p
      class={className()}
      role={messageProps.type === "error" ? "alert" : undefined}
      {...divProps}
    />
  );
}
