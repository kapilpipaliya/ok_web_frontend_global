import { Icon } from "@iconify-icon/solid";
import { Style } from "@solidjs/meta";
import { createUniqueId } from "solid-js";

import type { Id } from "~/lib/graph/graph";
import { css } from "~/lib/styles";

export function OpenComponentSettings(
  props: Readonly<{ css?: string; id: Id }>,
) {
  const id = createUniqueId();
  return (<>
  <Style>
    {css`
  ${props.css}
`.replaceAll("._id", `.${id}`)}
  </Style>
    <Icon
      class={id}
      height={21}
      icon={"ph:gear"}
      noobserver
      onClick={() => {
        const currentURL = window.location.href;
        const navigateUrl = `${currentURL
          .split("/")
          .slice(0, -2)
          .join("/")}/Comp/${props.id}`;
        window.open(navigateUrl, "_blank");
      }}
      width={21}
    /></>
  );
}
