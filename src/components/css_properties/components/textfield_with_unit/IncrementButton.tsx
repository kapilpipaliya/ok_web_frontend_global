import { Icon } from "@iconify-icon/solid";

export function IncrementButton(props: { downIncrement: (event: MouseEvent) => void; }) {
  return (
    <button
      class="bg:transparent border:none cursor:ns-resize"
      onMouseDown={props.downIncrement}
    >
      <Icon class="color:grey" icon="gg:scroll-v" />
    </button>
  );
}
