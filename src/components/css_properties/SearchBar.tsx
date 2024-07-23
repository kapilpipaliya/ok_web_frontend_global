import { Icon } from "@iconify-icon/solid";
import { type JSX, splitProps } from "solid-js";

export function SearchBar(
  props: Readonly<
    {
      handleChange: (value: string) => void;
    } & JSX.InputHTMLAttributes<HTMLInputElement>
  >,
) {
  const [local, inputProps] = splitProps(props, ["handleChange"]);
  return (
    <div class="lh:28px flex align-items:center p:5|0 position:relative w:full">
      <Icon class="icon color:#9e9ea7 pl:6 position:absolute" icon="iconamoon:search" />
      <input
        class="lh:28px {outline:none;border-color:#79b5ea;bg:#fff;box-shadow:0|0|0|2px|#d5dfee}:focus b:2px|solid|transparent bg:#f3f3f4 color:#0d0c22 color:#9e9ea7::placeholder f:14 h:40px outline:none p:0|1rem|0|1.8rem r:8px transition:0.3s|ease w:100%"
        onInput={(e) => props.handleChange(e.target.value)}
        type="search"
        value={props.value}
        {...inputProps}
      />
    </div>

  );
}
