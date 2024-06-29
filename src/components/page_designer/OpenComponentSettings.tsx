import { Icon } from "@iconify-icon/solid";
import type { Id } from "~/lib/graph/graph";

export const OpenComponentSettings = (props: { id: Id; class?: string }) => {
  return <Icon
    onClick={() => {
      const currentURL = window.location.href;
      const navigateUrl = `${currentURL
        .split("/")
        .slice(0, -2)
        .join("/")}/Comp/${props.id}`;
      window.open(navigateUrl, "_blank");
    }}
    class={`${props.class ?? ""}`}
    icon={"solar:settings-linear"}
    width={21}
    height={21} />;
};