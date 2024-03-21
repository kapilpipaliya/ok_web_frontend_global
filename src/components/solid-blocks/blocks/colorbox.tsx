import { createSignal } from "solid-js";
export const ColorBox = () => {
  const [color, setColor] = createSignal("#ff0000"); // Initial color is red

  const handleChange = (event: any) => {
    setColor(event.target.value);
  };

  return (
    <div>
      <div
        style={{ "background-color": color(), width: "100px", height: "100px" }}
      >
        <input type="color" value={color()} onInput={handleChange} />
      </div>
    </div>
  );
};