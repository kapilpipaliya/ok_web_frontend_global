import { JSX, Show } from "solid-js";

export function CardHeader(props: { children?: JSX.Element, imgSrc?: string; title?: string }) {
  return (
    <>
      <Show when={props.imgSrc}>
        <img
          alt={props.title}
          class="bg:rgb(255,255,255) border-radius:0.5rem box-shadow:0|0|0|1px|rgba(0,0,0,0.5) flex:none h:3rem object-fit:cover w:3rem"
          src={props.imgSrc}
        />
      </Show>
      <div class="lh:1.25rem color:rgb(17,24,39) f:0.875rem font-weight:500 leading:1.5rem">
        {props.title}
      </div>
      {props.children}
    </>
  );
}
