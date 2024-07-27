

import { IconButton } from "~/components/IconButton";

export function IncrementButton(props: { downIncrement: (event: MouseEvent) => void; }) {
  return (
    <IconButton
      class="bg:transparent border:none cursor:ns-resize"
      icon={"gg:scroll-v"}
      onMouseDown={props.downIncrement}
      size={16}
    />
  );
}
