import { Icon } from "@iconify-icon/solid";

import type { Id } from "~/lib/graph/graph";

export const OpenComponentSettings = (
  props: Readonly<{ class?: string; id: Id }>,
) => {
  return (
    <Icon
      class={`${props.class ?? ""}`}
      height={21}
      icon={"solar:settings-linear"}
      onClick={() => {
        const currentURL = window.location.href;
        const navigateUrl = `${currentURL
          .split("/")
          .slice(0, -2)
          .join("/")}/Comp/${props.id}`;
        window.open(navigateUrl, "_blank");
      }}
      width={21}
    />
  );
};
