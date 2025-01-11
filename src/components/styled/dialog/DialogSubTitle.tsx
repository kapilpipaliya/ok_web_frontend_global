import { ParentProps } from "solid-js";

export function DialogSubTitle(props: ParentProps) {
  return (
    <div class="lh:1.25rem color:gray-50  f:0.875rem max-width:36rem mt:0.5rem ">
      <p>{props.children}</p>
    </div>
  );
}
