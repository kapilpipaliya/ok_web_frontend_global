import {createEffect, createSignal, createUniqueId, type JSX, Show} from "solid-js";

export function CustomTooltip(props: Readonly<{
  message: any;
  children: JSX.Element;
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
        id={id}
        class={
          "text:nowrap center max-w:fit-content min-w:fit-content z-index:1 f:13 w:full font-weight:300 font-family:poppins abs mt:3 bg:#333 p:3|10 color:#fff r:5"
        }
      >
        <Show when={props.title}>
          <div class={"font-weight:500 f:14"}>{props.title}</div>
        </Show>
        <Show when={props.message}>
          {props.message}
        </Show>
      </div>
    </div>
  );
}
