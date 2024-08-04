import type { JSX } from "solid-js";

export function CardGrid(props: Readonly<{ cardSize: number; children: JSX.Element; }>) {
  return (
    <div class={`display:grid gap-x:0.75rem gap-x:1rem@xl gap-y:1rem grid-cols:1 grid-cols:${props.cardSize}@lg mt:1.5rem`}>
      {props.children}
    </div>
  );
}
