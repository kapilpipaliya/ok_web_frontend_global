import { type JSX, Show, splitProps } from "solid-js";

import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

// TODO: Depricate this component
export function DialogFooter(
  props: JSX.IntrinsicElements["button"] & {
    buttonText?: string;
    children?: any;
    disabled?: boolean;
  },
) {
  const [local, buttonProps] = splitProps(props, ["children", "buttonText"]);

  return (
    <div class="flex ai:center gap:0.50rem  mb:6">
      <Show when={local.children}>{local.children}</Show>
      <Show when={!local.children}>
        <button class={ SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS  } {...buttonProps} type="button">
          {local.buttonText || "Save"}
        </button>
      </Show>
    </div>
  );
}
