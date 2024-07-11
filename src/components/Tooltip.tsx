import { type JSX, Show, createSignal } from "solid-js";

export function CustomTooltip(
  props: Readonly<{
    children: JSX.Element;
    message: JSX.Element;
    title?: string;
  }>,
) {
  const [isHovered, setIsHovered] = createSignal(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div class={"rel"}>
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {props.children}
      </div>
      <Show when={isHovered()}>
        <div
          class={
            "abs center bg:#333 color:#fff f:13 font-family:poppins font-weight:300 max-w:fit-content min-w:fit-content mt:3 p:3|10 r:5 text:nowrap w:full z-index:1"
          }
        >
          <Show when={props.title}>
            <div class={"f:14 font-weight:500"}>{props.title}</div>
          </Show>
          <Show when={props.message}>{props.message}</Show>
        </div>
      </Show>
    </div>
  );
}
