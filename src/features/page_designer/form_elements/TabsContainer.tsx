import type { ParentProps } from "solid-js";

export function TabsContainer(props: ParentProps) {
  return (
    <div class="lh:1rem border-bottom-width:1px border-color:rgb(229,231,235) color:rgb(107,114,128) f:0.875rem font-weight:500 mb:10 text-align:center">
      {props.children}
    </div>
  );
}
