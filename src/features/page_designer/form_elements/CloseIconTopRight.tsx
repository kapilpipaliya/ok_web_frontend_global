import { Icon } from "@iconify-icon/solid";

import { useZIndex } from "~/components/fields/ZIndex";
import { css } from "~/lib/styles";

// unused
export function CloseIconTopRight(props: Readonly<{ onClick: () => void }>) {
  const zIndex = useZIndex();
  return (
    <Icon
      css={css`
  cursor: pointer;
  color: #c1c1c1;
  position: absolute;
  right: 0rem;
  z-index: ${zIndex};
`}
      height={30}
      icon={"ph:x-bold"}
      noobserver
      onClick={props.onClick}
      width={30}
    />
  );
}
