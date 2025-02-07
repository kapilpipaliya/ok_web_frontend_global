import { Icon } from "@iconify-icon/solid";

import { useZIndex } from "~/components/fields/ZIndex";

export function CloseIconTopRight(props: Readonly<{ onClick: () => void }>) {
  const zIndex = useZIndex();
  return (
    <Icon
      class={`cursor:pointer fg:#c1c1c1 position:absolute right:0rem z:${zIndex}`}
      height={30}
      icon={"iconamoon:close-duotone"}
      noobserver
      onClick={props.onClick}
      width={30}
    />
  );
}
