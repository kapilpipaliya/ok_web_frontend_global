import { createEffect, createSignal } from "solid-js";

export const ColorBox = (props: any) => {
  const [color, setColor] = createSignal("#EEBEBE"); // Initial color is red

  const handleChange = (event: any) => {
    setColor(event.target.value);
  };

  return (
    <div>
      <div class={`${props.class ?? ""} bg:${color()} w:100px h:100px`}>
        {props.colorPick && (
          <input type="color" value={color()} onInput={handleChange} />
        )}
      </div>
    </div>
  );
};
