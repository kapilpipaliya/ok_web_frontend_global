import {type JSX, Show, createEffect, createSignal, createUniqueId} from "solid-js";

export function CustomTooltip(props: Readonly<{
  children: JSX.Element;
  message: any;
  title?: string;
}>) {
  const [isHovered, setIsHovered] = createSignal(false);
  const id = createUniqueId();

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  createEffect(() => {
    const element = document.getElementById(id);
    if (element) {
      if (isHovered() ) {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
    }
  });

  return (
    <div class={"rel"}>
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {props.children}
      </div>
      <div
        class={
          "abs center bg:#333 color:#fff f:13 font-family:poppins font-weight:300 max-w:fit-content min-w:fit-content mt:3 p:3|10 r:5 text:nowrap w:full z-index:1"
        }
        id={id}
      >
        <Show when={props.title}>
          <div class={"f:14 font-weight:500"}>{props.title}</div>
        </Show>
        <Show when={props.message}>
          {props.message}
        </Show>
      </div>
    </div>
  );
}
