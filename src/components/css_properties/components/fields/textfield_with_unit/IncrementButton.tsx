import { IconButton } from "~/components/styled/IconButton";

export function IncrementButton(
  props: Readonly<{ downIncrement: (event: MouseEvent) => void }>,
) {
  return (
    <IconButton
      class="bg:transparent border:none cursor:ns-resize"
      icon={"gg:scroll-v"}
      onMouseDown={props.downIncrement}
      size={16}
    />
  );
}
